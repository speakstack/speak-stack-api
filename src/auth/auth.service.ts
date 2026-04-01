import { Injectable, Logger } from "@nestjs/common";
import { JwtService, TokenExpiredError } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntityManager, MoreThan, QueryFailedError, Repository } from "typeorm";
import { OAuth2Client } from "google-auth-library";
import { createHash, randomBytes, randomInt } from "crypto";
import { MailService } from "../mail/mail.service";
import { AppException } from "../common/exceptions/app.exception";
import { ErrorCode } from "../common/enums/error-code.enum";
import { User } from "../user/entities/user.entity";
import {
  UserLanguage,
  UserLanguageRelation,
} from "../user-language/entities/user-language.entity";
import { EmailVerification } from "./entities/email-verification.entity";
import { JwtPayload } from "./types/tokens.type";
import { SignInDto, SignUpDto, TokensDto, UserProfileDto } from "./dto/auth.dto";

const ACCESS_TOKEN_SECRET = Bun.env.ACCESS_TOKEN_SECRET || "at-secret-key";
const REFRESH_TOKEN_SECRET = Bun.env.REFRESH_TOKEN_SECRET || "rt-secret-key";
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "30d";
const BCRYPT_COST = 10;
const GOOGLE_CLIENT_ID = Bun.env.GOOGLE_CLIENT_ID;

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const OTP_COOLDOWN_MS = 60 * 1000; // 60 seconds
const OTP_MAX_SEND_PER_WINDOW = 3;
const OTP_SEND_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const OTP_MAX_ATTEMPTS = 3;
const OTP_BLOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const OTP_VERIFIED_WINDOW_MS = 10 * 60 * 1000; // 10 minutes to complete sign-up after verify

/**
 * Authentication service implementing JWT token rotation logic.
 * Uses TypeORM repository for user persistence.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserLanguage)
    private readonly userLanguageRepository: Repository<UserLanguage>,
    @InjectRepository(EmailVerification)
    private readonly emailVerificationRepository: Repository<EmailVerification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Authenticates user and generates token pair.
   * @param dto - Sign in credentials (username or email)
   * @returns Access and refresh tokens
   */
  async signIn(dto: SignInDto): Promise<TokensDto> {
    const user = await this.findUserByLogin(dto.identifier);
    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND);
    }
    if (!user.isActive) {
      throw new AppException(ErrorCode.USER_INACTIVE);
    }
    if (!user.passwordHash) {
      throw new AppException(ErrorCode.PASSWORD_NOT_SET);
    }
    const isPasswordValid = await Bun.password.verify(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new AppException(ErrorCode.INVALID_PASSWORD);
    }
    const tokens = await this.generateTokens(user.id);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);
    this.logger.log(`User ${user.username} signed in successfully`);
    return tokens;
  }

  /**
   * Registers a new user and generates token pair.
   * @param dto - Sign up data
   * @returns Access and refresh tokens
   */
  async signUp(dto: SignUpDto): Promise<TokensDto> {
    const passwordHash = await Bun.password.hash(dto.password, {
      algorithm: "bcrypt",
      cost: BCRYPT_COST,
    });

    // Use transaction with pessimistic lock to prevent double-consumption
    const result = await this.dataSource.transaction(async (manager) => {
      // Lock verification record to prevent concurrent sign-ups
      const verification = await manager.findOne(EmailVerification, {
        where: { id: dto.verificationId },
        lock: { mode: "pessimistic_write" },
      });
      if (!verification || !verification.isVerified || verification.usedAt) {
        throw new AppException(ErrorCode.EMAIL_NOT_VERIFIED);
      }
      if (
        !verification.verifiedAt ||
        verification.verifiedAt.getTime() + OTP_VERIFIED_WINDOW_MS < Date.now()
      ) {
        throw new AppException(ErrorCode.INVALID_VERIFICATION);
      }

      const email = verification.email;

      // Check if this is an existing Google user without password
      const existingUser = await manager.findOne(User, {
        where: { email },
      });

      if (existingUser && existingUser.passwordHash) {
        throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
      }

      let user: User;

      if (existingUser) {
        // Existing Google user — set password
        existingUser.passwordHash = passwordHash;
        user = await manager.save(User, existingUser);
        this.logger.log(`Password set for existing Google user ${email}`);
      } else {
        // New user — require username
        if (!dto.username) {
          throw new AppException(ErrorCode.VALIDATION_ERROR, {
            username: "Username is required for new accounts",
          });
        }
        const newUser = manager.create(User, {
          username: dto.username,
          email,
          passwordHash,
          isActive: true,
        });
        user = await this.saveUserOrThrowWithManager(manager, newUser);
        this.logger.log(`New user registered: ${email}`);
      }

      // Mark verification as used
      verification.usedAt = new Date();
      await manager.save(EmailVerification, verification);

      return user;
    });

    const tokens = await this.generateTokens(result.id);
    await this.updateRefreshTokenHash(result.id, tokens.refreshToken);
    return tokens;
  }

  async sendOtp(email: string): Promise<{ verificationId: string }> {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already has an account with password
    const existingUser = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });
    if (existingUser && existingUser.passwordHash) {
      throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
    }

    const now = new Date();

    // Check 30-min block after max failed attempts
    const blockedRecord = await this.emailVerificationRepository.findOne({
      where: {
        email: normalizedEmail,
        attempts: MoreThan(OTP_MAX_ATTEMPTS - 1),
        createdAt: MoreThan(new Date(now.getTime() - OTP_BLOCK_DURATION_MS)),
      },
    });
    if (blockedRecord) {
      throw new AppException(ErrorCode.OTP_MAX_ATTEMPTS_EXCEEDED);
    }

    // Check cooldown (60s between resends)
    const lastRecord = await this.emailVerificationRepository.findOne({
      where: {
        email: normalizedEmail,
        createdAt: MoreThan(new Date(now.getTime() - OTP_COOLDOWN_MS)),
      },
      order: { createdAt: "DESC" },
    });
    if (lastRecord) {
      const retryAfter = Math.ceil(
        (lastRecord.createdAt.getTime() + OTP_COOLDOWN_MS - now.getTime()) / 1000,
      );
      throw new AppException(ErrorCode.OTP_COOLDOWN, {
        retryAfter: String(retryAfter),
      });
    }

    // Check max sends per window (3 per 10 min)
    const recentCount = await this.emailVerificationRepository.count({
      where: {
        email: normalizedEmail,
        createdAt: MoreThan(new Date(now.getTime() - OTP_SEND_WINDOW_MS)),
      },
    });
    if (recentCount >= OTP_MAX_SEND_PER_WINDOW) {
      throw new AppException(ErrorCode.OTP_RATE_LIMITED);
    }

    // Generate OTP and save record
    const otp = String(randomInt(100000, 1000000));
    const otpHash = createHash("sha256").update(otp).digest("hex");
    const verification = this.emailVerificationRepository.create({
      email: normalizedEmail,
      otpHash,
      expiresAt: new Date(now.getTime() + OTP_EXPIRY_MS),
    });
    const savedVerification = await this.emailVerificationRepository.save(verification);

    // Send email (delete record on failure)
    try {
      await this.mailService.sendOtp(normalizedEmail, otp);
    } catch (error) {
      await this.emailVerificationRepository.delete(savedVerification.id);
      throw error;
    }

    this.logger.log(`OTP sent to ${normalizedEmail}`);
    return { verificationId: savedVerification.id };
  }

  async verifyOtp(
    verificationId: string,
    otp: string,
  ): Promise<{ verificationId: string; isExistingUser: boolean }> {
    const record = await this.emailVerificationRepository.findOne({
      where: { id: verificationId },
    });
    if (!record || record.usedAt) {
      throw new AppException(ErrorCode.INVALID_VERIFICATION);
    }

    // Idempotent: if already verified and not used, return success
    if (record.isVerified) {
      const isExistingUser = await this.isExistingGoogleUserWithoutPassword(record.email);
      return { verificationId: record.id, isExistingUser };
    }

    if (record.expiresAt < new Date()) {
      throw new AppException(ErrorCode.OTP_EXPIRED);
    }
    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      throw new AppException(ErrorCode.OTP_MAX_ATTEMPTS_EXCEEDED);
    }

    const otpHash = createHash("sha256").update(otp).digest("hex");
    if (otpHash !== record.otpHash) {
      record.attempts += 1;
      await this.emailVerificationRepository.save(record);
      const attemptsRemaining = OTP_MAX_ATTEMPTS - record.attempts;
      throw new AppException(ErrorCode.OTP_INVALID, {
        attemptsRemaining: String(attemptsRemaining),
      });
    }

    record.isVerified = true;
    record.verifiedAt = new Date();
    await this.emailVerificationRepository.save(record);

    const isExistingUser = await this.isExistingGoogleUserWithoutPassword(record.email);
    this.logger.log(`OTP verified for ${record.email}`);
    return { verificationId: record.id, isExistingUser };
  }

  /**
   * Authenticates or registers a user via Google ID token.
   * Handles three cases: existing Google user, auto-link by email, new sign-up.
   * @param idToken - Google ID token from client SDK
   * @returns Access and refresh tokens
   */
  async googleSignIn(idToken: string): Promise<TokensDto> {
    if (!GOOGLE_CLIENT_ID) {
      throw new AppException(ErrorCode.GOOGLE_AUTH_CONFIG_ERROR);
    }

    const payload = await this.verifyGoogleIdToken(idToken);
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      throw new AppException(ErrorCode.GOOGLE_AUTH_FAILED);
    }

    // Case 1: Existing user with this googleId
    let user = await this.userRepository.findOne({ where: { googleId } });
    if (user) {
      if (!user.isActive) {
        throw new AppException(ErrorCode.USER_INACTIVE);
      }
      const tokens = await this.generateTokens(user.id);
      await this.updateRefreshTokenHash(user.id, tokens.refreshToken);
      this.logger.log(`Google sign-in for existing user ${user.email}`);
      return tokens;
    }

    // Case 2: Auto-link by email
    user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      if (!user.isActive) {
        throw new AppException(ErrorCode.USER_INACTIVE);
      }
      user.googleId = googleId;
      if (!user.avatarUrl && picture) {
        user.avatarUrl = picture;
      }
      if (!user.displayName && name) {
        user.displayName = name;
      }
      await this.userRepository.save(user);
      const tokens = await this.generateTokens(user.id);
      await this.updateRefreshTokenHash(user.id, tokens.refreshToken);
      this.logger.log(`Google account linked to existing user ${user.email}`);
      return tokens;
    }

    // Case 3: New user sign-up
    const tempUsername = `user_${randomBytes(4).toString("hex")}`;
    const newUser = this.userRepository.create({
      googleId,
      email,
      username: tempUsername,
      displayName: name || null,
      avatarUrl: picture || null,
      passwordHash: null,
      hasUsernameSet: false,
      isActive: true,
    });
    const savedUser = await this.saveUserOrThrow(newUser);
    const tokens = await this.generateTokens(savedUser.id);
    await this.updateRefreshTokenHash(savedUser.id, tokens.refreshToken);
    this.logger.log(`New user registered via Google: ${savedUser.email}`);
    return tokens;
  }

  /**
   * Sets a password for a Google-only user.
   * @param userId - The user ID from JWT payload
   * @param password - The new password
   */
  async setPassword(userId: string, password: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND);
    }
    if (user.passwordHash) {
      throw new AppException(ErrorCode.PASSWORD_ALREADY_SET);
    }
    const passwordHash = await Bun.password.hash(password, {
      algorithm: "bcrypt",
      cost: BCRYPT_COST,
    });
    await this.userRepository.update(userId, { passwordHash });
    this.logger.log(`Password set for user ${user.email}`);
  }

  /**
   * Invalidates user's refresh token (logout).
   * @param userId - The user ID from JWT payload
   */
  async logout(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND);
    }
    await this.userRepository.update(userId, { refreshTokenHash: null });
    this.logger.log(`User ${user.email} logged out successfully`);
  }

  /**
   * Retrieves current authenticated user's profile.
   * @param userId - The user ID from JWT payload
   * @returns User profile DTO (no sensitive fields)
   */
  async getCurrentUserProfile(userId: string): Promise<UserProfileDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND);
    }
    if (!user.isActive) {
      throw new AppException(ErrorCode.USER_INACTIVE);
    }
    return this.toUserProfileDto(user.id, user);
  }

  /**
   * Refreshes token pair using valid refresh token.
   * Implements token rotation: invalidates old RT, issues new AT & RT.
   * @param refreshToken - The refresh token from request body
   * @returns New access and refresh tokens
   */
  async refreshTokens(refreshToken: string): Promise<TokensDto> {
    const payload = this.verifyRefreshToken(refreshToken);
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND);
    }
    if (!user.refreshTokenHash) {
      throw new AppException(ErrorCode.INVALID_REFRESH_TOKEN);
    }
    const refreshTokenHash = this.hashToken(refreshToken);
    if (refreshTokenHash !== user.refreshTokenHash) {
      throw new AppException(ErrorCode.INVALID_REFRESH_TOKEN);
    }
    if (!user.isActive) {
      throw new AppException(ErrorCode.USER_INACTIVE);
    }
    const tokens = await this.generateTokens(user.id);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);
    this.logger.log(`Tokens refreshed for user ${user.email}`);
    return tokens;
  }

  private async toUserProfileDto(
    userId: string,
    user: User,
  ): Promise<UserProfileDto> {
    const nativeCount = await this.userLanguageRepository.count({
      where: { userId, relation: UserLanguageRelation.NATIVE },
    });
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      hasNativeLanguage: nativeCount > 0,
      hasGoogleLinked: user.googleId !== null,
      hasPassword: user.passwordHash !== null,
      hasUsernameSet: user.hasUsernameSet,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private async saveUserOrThrow(user: User): Promise<User> {
    try {
      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const detail = (error as QueryFailedError & { detail?: string }).detail;
        if (detail?.includes("username")) {
          throw new AppException(ErrorCode.USERNAME_ALREADY_EXISTS);
        }
        if (detail?.includes("email")) {
          throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        if (detail?.includes("google")) {
          throw new AppException(ErrorCode.GOOGLE_AUTH_FAILED);
        }
      }
      throw error;
    }
  }

  private async saveUserOrThrowWithManager(
    manager: EntityManager,
    user: User,
  ): Promise<User> {
    try {
      return await manager.save(User, user);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const detail = (error as QueryFailedError & { detail?: string }).detail;
        if (detail?.includes("username")) {
          throw new AppException(ErrorCode.USERNAME_ALREADY_EXISTS);
        }
        if (detail?.includes("email")) {
          throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
      }
      throw error;
    }
  }

  private async isExistingGoogleUserWithoutPassword(email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { email } });
    return !!user && !!user.googleId && !user.passwordHash;
  }

  private async verifyGoogleIdToken(
    idToken: string,
  ): Promise<{ sub: string; email: string; email_verified: boolean; name?: string; picture?: string }> {
    try {
      const client = new OAuth2Client(GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email_verified) {
        throw new AppException(ErrorCode.GOOGLE_AUTH_FAILED);
      }
      return {
        sub: payload.sub,
        email: payload.email!,
        email_verified: payload.email_verified,
        name: payload.name,
        picture: payload.picture,
      };
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      this.logger.warn(`Google ID token verification failed: ${error}`);
      throw new AppException(ErrorCode.GOOGLE_AUTH_FAILED);
    }
  }

  private verifyRefreshToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify<JwtPayload>(token, {
        secret: REFRESH_TOKEN_SECRET,
      });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new AppException(ErrorCode.REFRESH_TOKEN_EXPIRED);
      }
      throw new AppException(ErrorCode.INVALID_REFRESH_TOKEN);
    }
  }

  private async findUserByLogin(login: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: [{ username: login }, { email: login }],
    });
  }

  private async generateTokens(userId: string): Promise<TokensDto> {
    const payload: JwtPayload = { sub: userId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: ACCESS_TOKEN_SECRET,
        expiresIn: ACCESS_TOKEN_EXPIRY,
      }),
      this.jwtService.signAsync(payload, {
        secret: REFRESH_TOKEN_SECRET,
        expiresIn: REFRESH_TOKEN_EXPIRY,
      }),
    ]);
    return { accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  private async updateRefreshTokenHash(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hash = this.hashToken(refreshToken);
    await this.userRepository.update(userId, { refreshTokenHash: hash });
  }
}
