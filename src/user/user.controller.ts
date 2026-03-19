import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { UserService } from "./user.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UserProfileDto } from "../auth/dto/auth.dto";
import { GetCurrentUser } from "../common/decorators/get-current-user.decorator";
import { ApiSuccessMessage } from "../common/decorators/api-success-message.decorator";

@ApiTags("Users")
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @Patch("me")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update current user profile" })
  @ApiResponse({ status: HttpStatus.OK, type: UserProfileDto })
  @ApiSuccessMessage("Profile updated successfully")
  updateProfile(
    @GetCurrentUser("sub") userId: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserProfileDto> {
    return this.userService.updateProfile(userId, dto);
  }

  @ApiBearerAuth()
  @Post("me/avatar")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor("avatar", {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Upload profile avatar" })
  @ApiBody({
    schema: {
      type: "object",
      properties: { avatar: { type: "string", format: "binary" } },
    },
  })
  @ApiResponse({ status: HttpStatus.OK, type: UserProfileDto })
  @ApiSuccessMessage("Avatar uploaded successfully")
  uploadAvatar(
    @GetCurrentUser("sub") userId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UserProfileDto> {
    return this.userService.uploadAvatar(userId, file);
  }
}
