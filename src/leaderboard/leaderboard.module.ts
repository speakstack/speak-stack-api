import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { ReputationHistory } from '../reputation/entities/reputation-history.entity';
import { Post } from '../post/entities/post.entity';
import { Answer } from '../answer/entities/answer.entity';
import { Tag } from '../tag/entities/tag.entity';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, ReputationHistory, Post, Answer, Tag])],
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
})
export class LeaderboardModule {}
