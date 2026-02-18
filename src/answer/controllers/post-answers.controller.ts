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
  Query,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AnswerService } from "../answer.service";
import {
  AnswerResponseDto,
  CreateAnswerDto,
  ListAnswersQueryDto,
} from "../dto/answer.dto";
import { PostDetailResponseDto } from "../../post/dto/post.dto";
import { Public } from "../../common/decorators/public.decorator";
import { GetCurrentUser } from "../../common/decorators/get-current-user.decorator";
import { ApiSuccessMessage } from "../../common/decorators/api-success-message.decorator";

@ApiTags("Answers")
@Controller("posts/:postId")
export class PostAnswersController {
  constructor(private readonly answerService: AnswerService) {}

  @ApiBearerAuth()
  @Post("answers")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create an answer for a post" })
  @ApiResponse({ status: HttpStatus.CREATED, type: AnswerResponseDto })
  @ApiSuccessMessage("Answer created successfully")
  createAnswer(
    @GetCurrentUser("sub") userId: string,
    @Param("postId", ParseUUIDPipe) postId: string,
    @Body() dto: CreateAnswerDto,
  ): Promise<AnswerResponseDto> {
    return this.answerService.createAnswer(userId, postId, dto);
  }

  @Public()
  @Get("answers")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "List answers for a post" })
  @ApiResponse({ status: HttpStatus.OK, type: [AnswerResponseDto] })
  @ApiSuccessMessage("Answers retrieved successfully")
  listAnswers(
    @Param("postId", ParseUUIDPipe) postId: string,
    @Query() query: ListAnswersQueryDto,
  ): Promise<AnswerResponseDto[]> {
    return this.answerService.listAnswers(postId, query);
  }

  @ApiBearerAuth()
  @Post("accept-answer/:answerId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Accept an answer" })
  @ApiResponse({ status: HttpStatus.OK, type: PostDetailResponseDto })
  @ApiSuccessMessage("Answer accepted successfully")
  acceptAnswer(
    @GetCurrentUser("sub") userId: string,
    @Param("postId", ParseUUIDPipe) postId: string,
    @Param("answerId", ParseUUIDPipe) answerId: string,
  ): Promise<PostDetailResponseDto> {
    return this.answerService.acceptAnswer(userId, postId, answerId);
  }

  @ApiBearerAuth()
  @Delete("unaccept-answer")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Unaccept the accepted answer" })
  @ApiResponse({ status: HttpStatus.OK, type: PostDetailResponseDto })
  @ApiSuccessMessage("Answer unaccepted successfully")
  unacceptAnswer(
    @GetCurrentUser("sub") userId: string,
    @Param("postId", ParseUUIDPipe) postId: string,
  ): Promise<PostDetailResponseDto> {
    return this.answerService.unacceptAnswer(userId, postId);
  }
}
