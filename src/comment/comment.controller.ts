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
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CommentService } from "./comment.service";
import {
  CommentListResponseDto,
  CommentResponseDto,
  CreateCommentDto,
  ListCommentsQueryDto,
  UpdateCommentDto,
} from "./dto/comment.dto";
import { GetCurrentUser } from "../common/decorators/get-current-user.decorator";
import { ApiSuccessMessage } from "../common/decorators/api-success-message.decorator";
import { Public } from "../common/decorators/public.decorator";

@ApiTags("Comments")
@Controller("answers/:answerId/comments")
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiBearerAuth()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a comment on an answer" })
  @ApiResponse({ status: HttpStatus.CREATED, type: CommentResponseDto })
  @ApiSuccessMessage("Comment created successfully")
  createComment(
    @GetCurrentUser("sub") userId: string,
    @Param("answerId", ParseUUIDPipe) answerId: string,
    @Body() dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    return this.commentService.createComment(userId, answerId, dto);
  }

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "List comments on an answer" })
  @ApiResponse({ status: HttpStatus.OK, type: CommentListResponseDto })
  @ApiSuccessMessage("Comments retrieved successfully")
  listComments(
    @Param("answerId", ParseUUIDPipe) answerId: string,
    @Query() query: ListCommentsQueryDto,
  ): Promise<CommentListResponseDto> {
    return this.commentService.listComments(answerId, query);
  }

  @ApiBearerAuth()
  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Edit a comment" })
  @ApiResponse({ status: HttpStatus.OK, type: CommentResponseDto })
  @ApiSuccessMessage("Comment updated successfully")
  updateComment(
    @GetCurrentUser("sub") userId: string,
    @Param("answerId", ParseUUIDPipe) answerId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateCommentDto,
  ): Promise<CommentResponseDto> {
    return this.commentService.updateComment(userId, answerId, id, dto);
  }

  @ApiBearerAuth()
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a comment (soft delete)" })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @ApiSuccessMessage("Comment deleted successfully")
  deleteComment(
    @GetCurrentUser("sub") userId: string,
    @Param("answerId", ParseUUIDPipe) answerId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.commentService.deleteComment(userId, answerId, id);
  }
}
