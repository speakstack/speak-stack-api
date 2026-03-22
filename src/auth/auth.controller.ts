import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import {
  RefreshTokenDto,
  SignInDto,
  SignUpDto,
  GoogleSignInDto,
  SetPasswordDto,
  TokensDto,
  UserProfileDto,
} from "./dto/auth.dto";
import { Public } from "../common/decorators/public.decorator";
import { GetCurrentUser } from "../common/decorators/get-current-user.decorator";
import { ApiSuccessMessage } from "../common/decorators/api-success-message.decorator";

/**
 * Authentication controller handling sign in, sign up, sign out, and token refresh.
 */
@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("sign-up")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ status: HttpStatus.CREATED, type: TokensDto })
  @ApiSuccessMessage("User registered successfully")
  signUp(@Body() dto: SignUpDto): Promise<TokensDto> {
    return this.authService.signUp(dto);
  }

  @Public()
  @Post("sign-in")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Sign in with username or email" })
  @ApiResponse({ status: HttpStatus.OK, type: TokensDto })
  @ApiSuccessMessage("User signed in successfully")
  signIn(@Body() dto: SignInDto): Promise<TokensDto> {
    return this.authService.signIn(dto);
  }

  @Public()
  @Post("google")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Sign in or sign up with Google ID token" })
  @ApiResponse({ status: HttpStatus.OK, type: TokensDto })
  @ApiSuccessMessage("Google authentication successful")
  googleSignIn(@Body() dto: GoogleSignInDto): Promise<TokensDto> {
    return this.authService.googleSignIn(dto.idToken);
  }

  @ApiBearerAuth()
  @Post("sign-out")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Sign out and invalidate refresh token" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiSuccessMessage("User signed out successfully")
  signOut(@GetCurrentUser("sub") userId: string): Promise<void> {
    return this.authService.logout(userId);
  }

  @ApiBearerAuth()
  @Post("set-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Set password for Google-only users" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiSuccessMessage("Password set successfully")
  setPassword(
    @GetCurrentUser("sub") userId: string,
    @Body() dto: SetPasswordDto,
  ): Promise<void> {
    return this.authService.setPassword(userId, dto.password);
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh access and refresh tokens" })
  @ApiResponse({ status: HttpStatus.OK, type: TokensDto })
  @ApiSuccessMessage("Tokens refreshed successfully")
  refreshTokens(@Body() dto: RefreshTokenDto): Promise<TokensDto> {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @ApiBearerAuth()
  @Get("me")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get current authenticated user profile" })
  @ApiResponse({ status: HttpStatus.OK, type: UserProfileDto })
  @ApiSuccessMessage("User profile retrieved successfully")
  getCurrentUser(
    @GetCurrentUser("sub") userId: string,
  ): Promise<UserProfileDto> {
    return this.authService.getCurrentUserProfile(userId);
  }
}
