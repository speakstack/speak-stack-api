import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { BadgeService } from "./badge.service";
import { Badge } from "./entities/badge.entity";
import { Public } from "../common/decorators/public.decorator";

@ApiTags("Badges")
@Controller("badges")
export class BadgeController {
  constructor(private readonly badgeService: BadgeService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get all badge definitions" })
  @ApiResponse({ status: HttpStatus.OK, type: [Badge] })
  getBadges(): Promise<Badge[]> {
    return this.badgeService.getBadges();
  }
}
