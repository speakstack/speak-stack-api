import { Controller, Get, HttpCode, HttpStatus, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { TagService } from "./tag.service";
import { Tag } from "./entities/tag.entity";
import { Public } from "../common/decorators/public.decorator";
import { ApiSuccessMessage } from "../common/decorators/api-success-message.decorator";

export class ListTagsQueryDto {
  @IsOptional()
  @IsString()
  language?: string;
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
    return this.tagService.findAll(query.language);
  }
}
