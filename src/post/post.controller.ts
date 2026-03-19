import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { PostService } from "./post.service";
import {
  CreatePostDto,
  ListPostsQueryDto,
  PostAttachmentResponseDto,
  PostDetailResponseDto,
  PostListResponseDto,
  PostResponseDto,
  UpdatePostDto,
} from "./dto/post.dto";
import { Public } from "../common/decorators/public.decorator";
import { GetCurrentUser } from "../common/decorators/get-current-user.decorator";
import { ApiSuccessMessage } from "../common/decorators/api-success-message.decorator";

@ApiTags("Posts")
@Controller("posts")
export class PostController {
  constructor(private readonly postService: PostService) {}

  @ApiBearerAuth()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new post" })
  @ApiResponse({ status: HttpStatus.CREATED, type: PostResponseDto })
  @ApiSuccessMessage("Post created successfully")
  createPost(
    @GetCurrentUser("sub") userId: string,
    @Body() dto: CreatePostDto,
  ): Promise<PostResponseDto> {
    return this.postService.createPost(userId, dto);
  }

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "List posts with filters and pagination" })
  @ApiResponse({ status: HttpStatus.OK, type: PostListResponseDto })
  @ApiSuccessMessage("Posts retrieved successfully")
  listPosts(@Query() query: ListPostsQueryDto): Promise<PostListResponseDto> {
    return this.postService.listPosts(query);
  }

  @Public()
  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get a single post by ID" })
  @ApiResponse({ status: HttpStatus.OK, type: PostDetailResponseDto })
  @ApiSuccessMessage("Post retrieved successfully")
  getPost(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<PostDetailResponseDto> {
    return this.postService.getPost(id);
  }

  @ApiBearerAuth()
  @Put(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update a post" })
  @ApiResponse({ status: HttpStatus.OK, type: PostDetailResponseDto })
  @ApiSuccessMessage("Post updated successfully")
  updatePost(
    @GetCurrentUser("sub") userId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdatePostDto,
  ): Promise<PostDetailResponseDto> {
    return this.postService.updatePost(userId, id, dto);
  }

  @ApiBearerAuth()
  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete a post (soft delete)" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiSuccessMessage("Post deleted successfully")
  deletePost(
    @GetCurrentUser("sub") userId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.postService.deletePost(userId, id);
  }

  @ApiBearerAuth()
  @Post(":id/attachments")
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FilesInterceptor("files", 10, {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Upload attachments to a post" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        files: {
          type: "array",
          items: { type: "string", format: "binary" },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: [PostAttachmentResponseDto],
  })
  @ApiSuccessMessage("Attachments uploaded successfully")
  uploadAttachments(
    @GetCurrentUser("sub") userId: string,
    @Param("id", ParseUUIDPipe) postId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<PostAttachmentResponseDto[]> {
    return this.postService.uploadAttachments(userId, postId, files);
  }

  @ApiBearerAuth()
  @Delete(":id/attachments/:attachmentId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete an attachment from a post" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiSuccessMessage("Attachment deleted successfully")
  deleteAttachment(
    @GetCurrentUser("sub") userId: string,
    @Param("id", ParseUUIDPipe) postId: string,
    @Param("attachmentId", ParseUUIDPipe) attachmentId: string,
  ): Promise<void> {
    return this.postService.deleteAttachment(userId, postId, attachmentId);
  }
}
