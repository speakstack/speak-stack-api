import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsUUID } from "class-validator";
import {
  LanguageProficiency,
  UserLanguageRelation,
} from "../entities/user-language.entity";

export class CreateUserLanguageDto {
  @ApiProperty({ description: "Language UUID" })
  @IsUUID("4", { message: "Language ID must be a valid UUID" })
  languageId: string;

  @ApiProperty({ description: "Relation type", enum: UserLanguageRelation })
  @IsEnum(UserLanguageRelation, {
    message: "Relation must be one of: native, learning, can_help",
  })
  relation: UserLanguageRelation;

  @ApiPropertyOptional({ description: "Proficiency level", enum: LanguageProficiency })
  @IsOptional()
  @IsEnum(LanguageProficiency, {
    message: "Proficiency must be one of: beginner, intermediate, advanced, fluent, native",
  })
  proficiency?: LanguageProficiency;
}

export class UpdateUserLanguageDto {
  @ApiPropertyOptional({ description: "Proficiency level", enum: LanguageProficiency })
  @IsOptional()
  @IsEnum(LanguageProficiency, {
    message: "Proficiency must be one of: beginner, intermediate, advanced, fluent, native",
  })
  proficiency?: LanguageProficiency;
}

export class LanguageDto {
  @ApiProperty() id: string;
  @ApiProperty() code: string;
  @ApiProperty() name: string;
}

export class UserLanguageResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() language: LanguageDto;
  @ApiProperty({ enum: UserLanguageRelation }) relation: UserLanguageRelation;
  @ApiProperty({ nullable: true, enum: LanguageProficiency }) proficiency: LanguageProficiency | null;
  @ApiProperty() createdAt: Date;
}
