import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class SignInDto {
  @ApiProperty({ description: "Username or email address" })
  @IsString({ message: "Login must be a string" })
  @IsNotEmpty({ message: "Username or email is required" })
  identifier: string;

  @ApiProperty({ description: "User password" })
  @IsString({ message: "Password must be a string" })
  @IsNotEmpty({ message: "Password is required" })
  password: string;
}

export class SignUpDto {
  @ApiProperty({ description: "Unique username" })
  @IsString({ message: "Username must be a string" })
  @IsNotEmpty({ message: "Username is required" })
  @MinLength(3, { message: "Username must be at least 3 characters long" })
  @MaxLength(20, { message: "Username must not exceed 20 characters" })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: "Username can only contain letters, numbers, and underscores",
  })
  username: string;

  @ApiProperty({ description: "Email address" })
  @IsEmail({}, { message: "Please provide a valid email address" })
  @IsNotEmpty({ message: "Email is required" })
  email: string;

  @ApiProperty({ description: "User password" })
  @IsString({ message: "Password must be a string" })
  @IsNotEmpty({ message: "Password is required" })
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  password: string;

}

export class RefreshTokenDto {
  @ApiProperty({ description: "The refresh token" })
  @IsString({ message: "Refresh token must be a string" })
  @IsNotEmpty({ message: "Refresh token is required" })
  refreshToken: string;
}

export class TokensDto {
  @ApiProperty({ description: "JWT access token" })
  accessToken: string;

  @ApiProperty({ description: "JWT refresh token" })
  refreshToken: string;
}

export class UserProfileDto {
  @ApiProperty({ description: "User unique identifier" })
  id: string;

  @ApiProperty({ description: "Username" })
  username: string;

  @ApiProperty({ description: "Email address" })
  email: string;

  @ApiPropertyOptional({ description: "Display name", nullable: true })
  displayName: string | null;

  @ApiPropertyOptional({ description: "Avatar URL", nullable: true })
  avatarUrl: string | null;

  @ApiProperty({ description: "Account status" })
  isActive: boolean;

  @ApiProperty({ description: "Whether user has completed initial setup" })
  isSetupComplete: boolean;

  @ApiProperty({ description: "Account creation timestamp" })
  createdAt: Date;

  @ApiProperty({ description: "Last update timestamp" })
  updatedAt: Date;
}
