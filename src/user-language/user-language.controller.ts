import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { UserLanguageService } from "./user-language.service";
import {
  CreateUserLanguageDto,
  UpdateUserLanguageDto,
  UserLanguageResponseDto,
} from "./dto/user-language.dto";
import { GetCurrentUser } from "../common/decorators/get-current-user.decorator";
import { ApiSuccessMessage } from "../common/decorators/api-success-message.decorator";

@ApiTags("User Languages")
@ApiBearerAuth()
@Controller("users/languages")
export class UserLanguageController {
  constructor(private readonly userLanguageService: UserLanguageService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Add a language relation for current user" })
  @ApiResponse({ status: HttpStatus.CREATED })
  @ApiSuccessMessage("User language added successfully")
  createUserLanguage(
    @GetCurrentUser("sub") userId: string,
    @Body() dto: CreateUserLanguageDto,
  ): Promise<UserLanguageResponseDto> {
    return this.userLanguageService.createUserLanguage(userId, dto);
  }

  @Put(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update proficiency of own language relation" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiSuccessMessage("User language updated successfully")
  updateUserLanguage(
    @GetCurrentUser("sub") userId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserLanguageDto,
  ): Promise<UserLanguageResponseDto> {
    return this.userLanguageService.updateUserLanguage(userId, id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete own language relation" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiSuccessMessage("User language deleted successfully")
  deleteUserLanguage(
    @GetCurrentUser("sub") userId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.userLanguageService.deleteUserLanguage(userId, id);
  }
}
