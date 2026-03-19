import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  UserLanguage,
  UserLanguageRelation,
} from "./entities/user-language.entity";
import { User } from "../user/entities/user.entity";
import { Language } from "../language/entities/language.entity";
import { AppException } from "../common/exceptions/app.exception";
import { ErrorCode } from "../common/enums/error-code.enum";
import {
  CreateUserLanguageDto,
  UpdateUserLanguageDto,
  UserLanguageResponseDto,
} from "./dto/user-language.dto";

@Injectable()
export class UserLanguageService {
  constructor(
    @InjectRepository(UserLanguage)
    private readonly userLanguageRepository: Repository<UserLanguage>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
  ) {}

  /**
   * Retrieve language relations for the given user id.
   */
  async findByUserId(userId: string): Promise<UserLanguageResponseDto[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND);
    }
    const rows = await this.userLanguageRepository.find({
      where: { userId: user.id },
      relations: ["language"],
      order: { createdAt: "ASC" },
    });
    return rows.map((row) => this.toResponse(row));
  }

  async createUserLanguage(
    userId: string,
    dto: CreateUserLanguageDto,
  ): Promise<UserLanguageResponseDto> {
    this.validateProficiency(dto.relation, dto.proficiency ?? null);
    const language = await this.languageRepository.findOne({
      where: { id: dto.languageId },
    });
    if (!language) {
      throw new AppException(ErrorCode.LANGUAGE_NOT_FOUND);
    }
    const row = this.userLanguageRepository.create({
      userId,
      languageId: dto.languageId,
      relation: dto.relation,
      proficiency: dto.proficiency ?? null,
    });
    const saved = await this.userLanguageRepository.save(row);
    saved.language = language;
    return this.toResponse(saved);
  }

  async updateUserLanguage(
    userId: string,
    id: string,
    dto: UpdateUserLanguageDto,
  ): Promise<UserLanguageResponseDto> {
    const row = await this.userLanguageRepository.findOne({
      where: { id },
      relations: ["language"],
    });
    if (!row) {
      throw new AppException(ErrorCode.USER_LANGUAGE_NOT_FOUND);
    }
    if (row.userId !== userId) {
      throw new AppException(ErrorCode.FORBIDDEN);
    }
    this.validateProficiency(row.relation, dto.proficiency ?? null);
    row.proficiency = dto.proficiency ?? null;
    const saved = await this.userLanguageRepository.save(row);
    return this.toResponse(saved);
  }

  async deleteUserLanguage(userId: string, id: string): Promise<void> {
    const row = await this.userLanguageRepository.findOne({ where: { id } });
    if (!row) {
      throw new AppException(ErrorCode.USER_LANGUAGE_NOT_FOUND);
    }
    if (row.userId !== userId) {
      throw new AppException(ErrorCode.FORBIDDEN);
    }
    await this.userLanguageRepository.remove(row);
  }

  private validateProficiency(
    relation: UserLanguageRelation,
    proficiency: string | null,
  ): void {
    if (relation === UserLanguageRelation.NATIVE && proficiency !== null) {
      throw new AppException(
        ErrorCode.VALIDATION_ERROR,
        "Proficiency must not be set for native relation",
      );
    }
    if (relation !== UserLanguageRelation.NATIVE && proficiency === null) {
      throw new AppException(
        ErrorCode.VALIDATION_ERROR,
        "Proficiency is required for learning/can_help relation",
      );
    }
  }

  private toResponse(row: UserLanguage): UserLanguageResponseDto {
    return {
      id: row.id,
      language: {
        id: row.language.id,
        code: row.language.code,
        name: row.language.name,
      },
      relation: row.relation,
      proficiency: row.proficiency,
      createdAt: row.createdAt,
    };
  }
}
