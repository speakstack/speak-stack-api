// src/feed/feed.controller.ts
import { Controller, Get, HttpCode, HttpStatus, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { GetCurrentUser } from "../common/decorators/get-current-user.decorator";
import { ApiSuccessMessage } from "../common/decorators/api-success-message.decorator";
import { FeedService } from "./feed.service";
import { FeedQueryDto } from "./dto/feed-query.dto";
import { FeedResponseDto } from "./dto/feed-response.dto";

@ApiTags("Feed")
@Controller("posts/for-you")
@ApiBearerAuth()
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get personalized feed" })
  @ApiResponse({ status: HttpStatus.OK, type: FeedResponseDto })
  @ApiSuccessMessage("Feed retrieved successfully")
  getForYou(
    @GetCurrentUser("sub") userId: string,
    @Query() query: FeedQueryDto,
  ): Promise<FeedResponseDto> {
    return this.feedService.getForYou(userId, query);
  }
}
