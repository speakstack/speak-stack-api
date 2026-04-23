import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: "Display name" })
  @IsOptional()
  @IsString({ message: "Display name must be a string" })
  @MinLength(2, { message: "Display name must be at least 2 characters long" })
  @MaxLength(50, { message: "Display name must not exceed 50 characters" })
  displayName?: string;

  @ApiPropertyOptional({
    description: "Username (one-time set for Google sign-up users)",
  })
  @IsOptional()
  @IsString({ message: "Username must be a string" })
  @MinLength(3, { message: "Username must be at least 3 characters long" })
  @MaxLength(20, { message: "Username must not exceed 20 characters" })
  @Matches(/^[a-z0-9_]+$/, {
    message:
      "Username can only contain lowercase letters, numbers, and underscores",
  })
  username?: string;
}
