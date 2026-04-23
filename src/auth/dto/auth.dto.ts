import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
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
  @ApiProperty({ description: "Verification ID from verify-otp response" })
  @IsUUID("4", { message: "Verification ID must be a valid UUID" })
  @IsNotEmpty({ message: "Verification ID is required" })
  verificationId: string;

  @ApiProperty({
    description: "Unique username (required for new users)",
    required: false,
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
  hasNativeLanguage: boolean;

  @ApiProperty({ description: "Whether the user has a linked Google account" })
  hasGoogleLinked: boolean;

  @ApiProperty({ description: "Whether the user has a password set" })
  hasPassword: boolean;

  @ApiProperty({ description: "Whether the user has chosen a username" })
  hasUsernameSet: boolean;

  @ApiProperty({ description: "Reputation points" })
  reputation: number;

  @ApiProperty({ description: "Current level" })
  level: { id: number; name: string; minReputation: number };

  @ApiPropertyOptional({
    description: "Next level threshold (null if at max level)",
    nullable: true,
  })
  nextLevel: { id: number; name: string; minReputation: number } | null;

  @ApiProperty({ description: "Badges earned by the user" })
  badges: {
    id: string;
    name: string;
    slug: string;
    description: string;
    awardedAt: Date;
  }[];

  @ApiProperty({ description: "Account creation timestamp" })
  createdAt: Date;

  @ApiProperty({ description: "Last update timestamp" })
  updatedAt: Date;
}

export class GoogleSignInDto {
  @ApiProperty({ description: "Google ID token from client SDK" })
  @IsString({ message: "ID token must be a string" })
  @IsNotEmpty({ message: "ID token is required" })
  idToken: string;
}

export class SetPasswordDto {
  @ApiProperty({ description: "New password" })
  @IsString({ message: "Password must be a string" })
  @IsNotEmpty({ message: "Password is required" })
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  password: string;
}

export class SendOtpDto {
  @ApiProperty({ description: "Email address to verify" })
  @IsEmail({}, { message: "Please provide a valid email address" })
  @IsNotEmpty({ message: "Email is required" })
  email: string;
}

export class VerifyOtpDto {
  @ApiProperty({ description: "Verification ID from send-otp response" })
  @IsUUID("4", { message: "Verification ID must be a valid UUID" })
  @IsNotEmpty({ message: "Verification ID is required" })
  verificationId: string;

  @ApiProperty({ description: "6-digit verification code" })
  @IsString({ message: "OTP must be a string" })
  @IsNotEmpty({ message: "OTP is required" })
  @Matches(/^\d{6}$/, { message: "OTP must be exactly 6 digits" })
  otp: string;
}

export class SendOtpResponseDto {
  @ApiProperty({ description: "Verification ID to use in verify-otp" })
  verificationId: string;
}

export class VerifyOtpResponseDto {
  @ApiProperty({ description: "Verification ID to use in sign-up" })
  verificationId: string;

  @ApiProperty({
    description: "Whether the email belongs to an existing account",
  })
  isExistingUser: boolean;
}
