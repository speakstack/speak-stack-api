import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Put,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AnswerService } from "./answer.service";
import { AnswerResponseDto, UpdateAnswerDto } from "./dto/answer.dto";
import { GetCurrentUser } from "../common/decorators/get-current-user.decorator";
import { ApiSuccessMessage } from "../common/decorators/api-success-message.decorator";

@ApiTags("Answers")
@Controller("answers")
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @ApiBearerAuth()
  @Put(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update an answer" })
  @ApiResponse({ status: HttpStatus.OK, type: AnswerResponseDto })
  @ApiSuccessMessage("Answer updated successfully")
  updateAnswer(
    @GetCurrentUser("sub") userId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateAnswerDto,
  ): Promise<AnswerResponseDto> {
    return this.answerService.updateAnswer(userId, id, dto);
  }

  @ApiBearerAuth()
  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete an answer (soft delete)" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiSuccessMessage("Answer deleted successfully")
  deleteAnswer(
    @GetCurrentUser("sub") userId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.answerService.deleteAnswer(userId, id);
  }
}
