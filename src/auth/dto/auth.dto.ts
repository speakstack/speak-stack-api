import { ApiProperty } from "@nestjs/swagger";
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

  @ApiProperty({ description: "Display name" })
  @IsString({ message: "Display name must be a string" })
  @IsNotEmpty({ message: "Display name is required" })
  @MinLength(2, { message: "Display name must be at least 2 characters long" })
  @MaxLength(50, { message: "Display name must not exceed 50 characters" })
  displayName: string;
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
