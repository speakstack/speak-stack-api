import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QueryFailedError, Repository } from "typeorm";
import { randomUUID } from "crypto";
import * as path from "path";
import * as fs from "fs/promises";
import sharp from "sharp";
import { User } from "./entities/user.entity";
import {
  UserLanguage,
  UserLanguageRelation,
} from "../user-language/entities/user-language.entity";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UserProfileDto } from "../auth/dto/auth.dto";
import { AppException } from "../common/exceptions/app.exception";
import { ErrorCode } from "../common/enums/error-code.enum";
import { LevelService } from "../level/level.service";
import { BadgeService } from "../badge/badge.service";

const AVATAR_SIZE = 256;
const AVATAR_QUALITY = 80;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const UPLOADS_DIR = path.join(process.cwd(), "uploads", "avatars");

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserLanguage)
    private readonly userLanguageRepository: Repository<UserLanguage>,
    private readonly levelService: LevelService,
    private readonly badgeService: BadgeService,
  ) {}

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UserProfileDto> {
    const user = await this.findActiveUser(userId);

    if (dto.username !== undefined) {
      if (user.hasUsernameSet) {
        throw new AppException(ErrorCode.USERNAME_ALREADY_SET);
      }
      user.username = dto.username;
      user.hasUsernameSet = true;
    }

    if (dto.displayName !== undefined) {
      user.displayName = dto.displayName;
    }

    try {
      const saved = await this.userRepository.save(user);
      return this.toUserProfileDto(saved.id, saved);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const detail = (error as QueryFailedError & { detail?: string }).detail;
        if (detail?.includes("username")) {
          throw new AppException(ErrorCode.USERNAME_ALREADY_EXISTS);
        }
      }
      throw error;
    }
  }

  async uploadAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<UserProfileDto> {
    if (!file) {
      throw new AppException(ErrorCode.VALIDATION_ERROR, {
        avatar: "Avatar file is required",
      });
    }
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new AppException(ErrorCode.VALIDATION_ERROR, {
        avatar: "File must be JPEG, PNG, WebP, or GIF",
      });
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new AppException(ErrorCode.VALIDATION_ERROR, {
        avatar: "File size must not exceed 5 MB",
      });
    }

    const user = await this.findActiveUser(userId);

    await fs.mkdir(UPLOADS_DIR, { recursive: true });

    const filename = `${randomUUID()}.webp`;
    const filepath = path.join(UPLOADS_DIR, filename);

    await sharp(file.buffer)
      .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: "cover", position: "centre" })
      .webp({ quality: AVATAR_QUALITY })
      .toFile(filepath);

    // Delete old avatar file if it was a local upload
    if (user.avatarUrl?.startsWith("/uploads/avatars/")) {
      const oldPath = path.join(process.cwd(), user.avatarUrl);
      await fs.unlink(oldPath).catch(() => {});
    }

    user.avatarUrl = `/uploads/avatars/${filename}`;
    const saved = await this.userRepository.save(user);

    this.logger.log(`Avatar uploaded for user ${user.username}`);
    return this.toUserProfileDto(saved.id, saved);
  }

  private async findActiveUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND);
    }
    if (!user.isActive) {
      throw new AppException(ErrorCode.USER_INACTIVE);
    }
    return user;
  }

  private async toUserProfileDto(
    userId: string,
    user: User,
  ): Promise<UserProfileDto> {
    const nativeCount = await this.userLanguageRepository.count({
      where: { userId, relation: UserLanguageRelation.NATIVE },
    });
    const { current: level, next: nextLevel } =
      await this.levelService.getLevelForReputation(user.reputation);
    const userBadges = await this.badgeService.getUserBadges(userId);
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
      reputation: user.reputation,
      level: {
        id: level.id,
        name: level.name,
        minReputation: level.minReputation,
      },
      nextLevel: nextLevel
        ? {
            id: nextLevel.id,
            name: nextLevel.name,
            minReputation: nextLevel.minReputation,
          }
        : null,
      badges: userBadges.map((ub) => ({
        id: ub.badge.id,
        name: ub.badge.name,
        slug: ub.badge.slug,
        description: ub.badge.description,
        awardedAt: ub.awardedAt,
      })),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
