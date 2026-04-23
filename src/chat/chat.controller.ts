import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
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
import { ChatService } from "./chat.service";
import {
  ChannelListResponseDto,
  ChannelResponseDto,
  CreateChannelDto,
  ListChannelsQueryDto,
  UpdateChannelDto,
} from "./dto/channel.dto";
import { AttachmentResponseDto } from "./dto/attachment.dto";
import {
  ListMessagesQueryDto,
  MessageListResponseDto,
} from "./dto/message.dto";
import { GetCurrentUser } from "../common/decorators/get-current-user.decorator";
import { ApiSuccessMessage } from "../common/decorators/api-success-message.decorator";
import { AdminGuard } from "../common/guards/admin.guard";

const MAX_CHAT_UPLOAD_BYTES = 10 * 1024 * 1024;

@ApiTags("Chat")
@ApiBearerAuth()
@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post("channels")
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a chat channel (admin only)" })
  @ApiResponse({ status: HttpStatus.CREATED, type: ChannelResponseDto })
  @ApiSuccessMessage("Channel created successfully")
  createChannel(
    @GetCurrentUser("sub") userId: string,
    @Body() dto: CreateChannelDto,
  ): Promise<ChannelResponseDto> {
    return this.chatService.createChannel(userId, dto);
  }

  @Patch("channels/:id")
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update a channel (admin only)" })
  @ApiResponse({ status: HttpStatus.OK, type: ChannelResponseDto })
  @ApiSuccessMessage("Channel updated successfully")
  updateChannel(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateChannelDto,
  ): Promise<ChannelResponseDto> {
    return this.chatService.updateChannel(id, dto);
  }

  @Delete("channels/:id")
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Soft-delete a channel (admin only)" })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @ApiSuccessMessage("Channel deleted successfully")
  deleteChannel(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return this.chatService.softDeleteChannel(id);
  }

  @Get("channels")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "List non-deleted channels" })
  @ApiResponse({ status: HttpStatus.OK, type: ChannelListResponseDto })
  @ApiSuccessMessage("Channels retrieved successfully")
  listChannels(
    @Query() query: ListChannelsQueryDto,
  ): Promise<ChannelListResponseDto> {
    return this.chatService.listChannels(query);
  }

  @Get("channels/:id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get channel detail" })
  @ApiResponse({ status: HttpStatus.OK, type: ChannelResponseDto })
  @ApiSuccessMessage("Channel retrieved successfully")
  getChannel(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<ChannelResponseDto> {
    return this.chatService.getChannel(id);
  }

  @Get("channels/:id/messages")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "List messages (cursor pagination, DESC)" })
  @ApiResponse({ status: HttpStatus.OK, type: MessageListResponseDto })
  @ApiSuccessMessage("Messages retrieved successfully")
  listMessages(
    @Param("id", ParseUUIDPipe) channelId: string,
    @Query() query: ListMessagesQueryDto,
  ): Promise<MessageListResponseDto> {
    return this.chatService.listMessages(channelId, query);
  }

  @Post("attachments")
  @UseInterceptors(
    FileInterceptor("file", { limits: { fileSize: MAX_CHAT_UPLOAD_BYTES } }),
  )
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Upload a chat attachment (link on message:send)" })
  @ApiBody({
    schema: {
      type: "object",
      properties: { file: { type: "string", format: "binary" } },
    },
  })
  @ApiResponse({ status: HttpStatus.CREATED, type: AttachmentResponseDto })
  @ApiSuccessMessage("Attachment uploaded successfully")
  uploadAttachment(
    @GetCurrentUser("sub") userId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<AttachmentResponseDto> {
    return this.chatService.uploadAttachment(userId, file);
  }
}
