import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserLanguageService } from "./user-language.service";
import { UserLanguageResponseDto } from "./dto/user-language.dto";
import { Public } from "../common/decorators/public.decorator";
import { ApiSuccessMessage } from "../common/decorators/api-success-message.decorator";

@ApiTags("User Languages")
@Controller("users/:userId/languages")
export class UserLanguagesController {
  constructor(private readonly userLanguageService: UserLanguageService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "List a user's language relations" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiSuccessMessage("User languages retrieved successfully")
  findByUserId(
    @Param("userId", ParseUUIDPipe) userId: string,
  ): Promise<UserLanguageResponseDto[]> {
    return this.userLanguageService.findByUserId(userId);
  }
}
