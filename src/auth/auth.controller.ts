import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  RefreshTokenDto,
  SignInDto,
  SignUpDto,
  TokensDto,
} from './dto/auth.dto';
import type { Tokens } from './types/tokens.type';
import { Public, GetCurrentUser, ApiSuccessMessage } from '../common';

/**
 * Authentication controller handling sign in, sign up, sign out, and token refresh.
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: HttpStatus.CREATED, type: TokensDto })
  @ApiSuccessMessage('User registered successfully')
  signUp(@Body() dto: SignUpDto): Promise<Tokens> {
    return this.authService.signUp(dto);
  }

  @Public()
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with username or email' })
  @ApiResponse({ status: HttpStatus.OK, type: TokensDto })
  @ApiSuccessMessage('User signed in successfully')
  signIn(@Body() dto: SignInDto): Promise<Tokens> {
    return this.authService.signIn(dto);
  }

  @ApiBearerAuth()
  @Post('sign-out')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign out and invalidate refresh token' })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiSuccessMessage('User signed out successfully')
  signOut(@GetCurrentUser('sub') userId: string): Promise<void> {
    return this.authService.logout(userId);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access and refresh tokens' })
  @ApiResponse({ status: HttpStatus.OK, type: TokensDto })
  @ApiSuccessMessage('Tokens refreshed successfully')
  refreshTokens(@Body() dto: RefreshTokenDto): Promise<Tokens> {
    return this.authService.refreshTokens(dto.refreshToken);
  }
}
