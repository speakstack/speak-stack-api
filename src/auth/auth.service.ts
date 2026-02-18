import { Injectable, Logger } from "@nestjs/common";
import { JwtService, TokenExpiredError } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { QueryFailedError, Repository } from "typeorm";
import { createHash } from "crypto";
import { AppException } from "../common/exceptions/app.exception";
import { ErrorCode } from "../common/enums/error-code.enum";
import { User } from "../user/entities/user.entity";
import { JwtPayload } from "./types/tokens.type";
import { SignInDto, SignUpDto, TokensDto, UserProfileDto } from "./dto/auth.dto";

const ACCESS_TOKEN_SECRET = Bun.env.ACCESS_TOKEN_SECRET || "at-secret-key";
const REFRESH_TOKEN_SECRET = Bun.env.REFRESH_TOKEN_SECRET || "rt-secret-key";
const ACCESS_TOKEN_EXPIRY = "1m";
const REFRESH_TOKEN_EXPIRY = "7d";
const BCRYPT_COST = 10;

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
    private readonly jwtService: JwtService,
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
    const isPasswordValid = await Bun.password.verify(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new AppException(ErrorCode.INVALID_PASSWORD);
    }
    const tokens = await this.generateTokens(user.id);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);
    this.logger.log(`User ${user.email} signed in successfully`);
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
    const user = this.userRepository.create({
      username: dto.username,
      email: dto.email,
      passwordHash,
      displayName: dto.displayName,
      isActive: true,
    });
    const savedUser = await this.saveUserOrThrow(user);
    const tokens = await this.generateTokens(savedUser.id);
    await this.updateRefreshTokenHash(savedUser.id, tokens.refreshToken);
    this.logger.log(`User ${savedUser.email} registered successfully`);
    return tokens;
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
    return this.toUserProfileDto(user);
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

  private toUserProfileDto(user: User): UserProfileDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      isActive: user.isActive,
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
      }
      throw error;
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
