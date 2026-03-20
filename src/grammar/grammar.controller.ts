import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { GrammarService } from "./grammar.service";
import { GrammarCheckDto } from "./dto/grammar-check.dto";
import { GrammarCheckResponseDto } from "./dto/grammar-check-response.dto";
import { ApiSuccessMessage } from "../common/decorators/api-success-message.decorator";

@ApiTags("Grammar")
@Controller("grammar")
export class GrammarController {
  constructor(private readonly grammarService: GrammarService) {}

  @ApiBearerAuth()
  @Post("check")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Check text for grammar issues" })
  @ApiResponse({ status: HttpStatus.OK, type: GrammarCheckResponseDto })
  @ApiSuccessMessage("Grammar check completed")
  check(@Body() dto: GrammarCheckDto): Promise<GrammarCheckResponseDto> {
    return this.grammarService.check(dto.text);
  }
}
