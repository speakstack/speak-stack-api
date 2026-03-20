import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { GetCurrentUser } from "../../common/decorators/get-current-user.decorator";
import { VoteService } from "../vote.service";
import { VoteDto, VoteResponseDto } from "../dto/vote.dto";

@ApiTags("Answer Votes")
@Controller("answers")
export class AnswerVoteController {
  constructor(private readonly voteService: VoteService) {}

  @ApiBearerAuth()
  @Post(":id/vote")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Vote on an answer (upvote/downvote/unvote)" })
  @ApiResponse({ status: HttpStatus.OK, type: VoteResponseDto })
  vote(
    @GetCurrentUser("sub") userId: string,
    @Param("id", ParseUUIDPipe) answerId: string,
    @Body() dto: VoteDto,
  ): Promise<VoteResponseDto> {
    return this.voteService.voteAnswer(userId, answerId, dto.value);
  }
}
