import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';
import {
  LeaderboardPeriod,
  LeaderboardResponseDto,
  TagChampionsResponseDto,
} from './dto/leaderboard.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get top 10 users by reputation' })
  @ApiQuery({ name: 'period', enum: ['all_time', 'weekly', 'monthly'], required: false })
  @ApiResponse({ status: HttpStatus.OK, type: LeaderboardResponseDto })
  getLeaderboard(
    @Query('period') period: LeaderboardPeriod = 'all_time',
  ): Promise<LeaderboardResponseDto> {
    return this.leaderboardService.getLeaderboard(period);
  }

  @Public()
  @Get('tag-champions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get top 5 tags with their champion user' })
  @ApiResponse({ status: HttpStatus.OK, type: TagChampionsResponseDto })
  getTagChampions(): Promise<TagChampionsResponseDto> {
    return this.leaderboardService.getTagChampions();
  }
}
