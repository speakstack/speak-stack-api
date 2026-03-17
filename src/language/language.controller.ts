import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { LanguageService } from "./language.service";
import { Language } from "./entities/language.entity";
import { Public } from "../common/decorators/public.decorator";
import { ApiSuccessMessage } from "../common/decorators/api-success-message.decorator";

@ApiTags("Languages")
@Controller("languages")
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "List all languages" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiSuccessMessage("Languages retrieved successfully")
  findAll(): Promise<Language[]> {
    return this.languageService.findAll();
  }
}
