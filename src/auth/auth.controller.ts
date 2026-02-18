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

  @ApiBearerAuth()
  @Post("sign-out")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Sign out and invalidate refresh token" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiSuccessMessage("User signed out successfully")
  signOut(@GetCurrentUser("sub") userId: string): Promise<void> {
    return this.authService.logout(userId);
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
