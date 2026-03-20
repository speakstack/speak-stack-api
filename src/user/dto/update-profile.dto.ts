import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: "Display name" })
  @IsOptional()
  @IsString({ message: "Display name must be a string" })
  @MinLength(2, { message: "Display name must be at least 2 characters long" })
  @MaxLength(50, { message: "Display name must not exceed 50 characters" })
  displayName?: string;
}
