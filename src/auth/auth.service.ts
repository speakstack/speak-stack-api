import { Injectable, Logger } from "@nestjs/common";
import { JwtService, TokenExpiredError } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { AppException } from "../common/exceptions/app.exception";
import { ErrorCode } from "../common/enums/error-code.enum";
import { User } from "../user/entities/user.entity";
import { Tokens, JwtPayload } from "./types/tokens.type";
import { SignInDto, SignUpDto } from "./dto/auth.dto";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "at-secret-key";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "rt-secret-key";
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";
const BCRYPT_SALT_ROUNDS = 10;

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
  async signIn(dto: SignInDto): Promise<Tokens> {
    const user = await this.findUserByLogin(dto.identifier);
    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND);
    }
    if (!user.isActive) {
      throw new AppException(ErrorCode.USER_INACTIVE);
    }
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new AppException(ErrorCode.INVALID_PASSWORD);
    }
    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);
    this.logger.log(`User ${user.email} signed in successfully`);
    return tokens;
  }

  /**
   * Registers a new user and generates token pair.
   * @param dto - Sign up data
   * @returns Access and refresh tokens
   */
  async signUp(dto: SignUpDto): Promise<Tokens> {
    await this.validateUniqueConstraints(dto.username, dto.email);
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
    const user = this.userRepository.create({
      username: dto.username,
      email: dto.email,
      passwordHash,
      displayName: dto.displayName,
      isActive: true,
    });
    const savedUser = await this.userRepository.save(user);
    const tokens = await this.generateTokens(savedUser.id, savedUser.email);
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
   * Refreshes token pair using valid refresh token.
   * Implements token rotation: invalidates old RT, issues new AT & RT.
   * @param refreshToken - The refresh token from request body
   * @returns New access and refresh tokens
   */
  async refreshTokens(refreshToken: string): Promise<Tokens> {
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
    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );
    if (!isRefreshTokenValid) {
      throw new AppException(ErrorCode.INVALID_REFRESH_TOKEN);
    }
    if (!user.isActive) {
      throw new AppException(ErrorCode.USER_INACTIVE);
    }
    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);
    this.logger.log(`Tokens refreshed for user ${user.email}`);
    return tokens;
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

  private async validateUniqueConstraints(
    username: string,
    email: string,
  ): Promise<void> {
    const existingUsername = await this.userRepository.findOne({
      where: { username },
    });
    if (existingUsername) {
      throw new AppException(ErrorCode.USERNAME_ALREADY_EXISTS);
    }
    const existingEmail = await this.userRepository.findOne({
      where: { email },
    });
    if (existingEmail) {
      throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
    }
  }

  private async findUserByLogin(login: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: [{ username: login }, { email: login }],
    });
  }

  private async generateTokens(userId: string, email: string): Promise<Tokens> {
    const payload: JwtPayload = {
      sub: userId,
      email,
    };
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

  private async updateRefreshTokenHash(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hash = await bcrypt.hash(refreshToken, BCRYPT_SALT_ROUNDS);
    await this.userRepository.update(userId, { refreshTokenHash: hash });
  }
}
