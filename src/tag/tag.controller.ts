import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from "@nestjs/common";
import {
  ApiOperation,
  ApiPropertyOptional,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { IsIn, IsOptional, IsString } from "class-validator";
import { TagService } from "./tag.service";
import { Tag } from "./entities/tag.entity";
import { TagDetailResponseDto } from "./dto/tag.dto";
import { Public } from "../common/decorators/public.decorator";
import { ApiSuccessMessage } from "../common/decorators/api-success-message.decorator";

export class ListTagsQueryDto {
  @ApiPropertyOptional({
    description: "Filter by language code (e.g. 'ja')",
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({
    description: "Filter scope: 'global' returns only language-neutral tags",
    enum: ["global"],
  })
  @IsOptional()
  @IsIn(["global"], { message: "Scope must be 'global'" })
  scope?: string;
}

@ApiTags("Tags")
@Controller("tags")
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "List all tags, optionally filtered by language" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiSuccessMessage("Tags retrieved successfully")
  findAll(@Query() query: ListTagsQueryDto): Promise<Tag[]> {
    return this.tagService.findAll(query.language, query.scope);
  }

  @Public()
  @Get(":slug")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get tag detail by slug" })
  @ApiResponse({ status: HttpStatus.OK, type: TagDetailResponseDto })
  @ApiSuccessMessage("Tag retrieved successfully")
  getTag(@Param("slug") slug: string): Promise<TagDetailResponseDto> {
    return this.tagService.findBySlug(slug);
  }
}
