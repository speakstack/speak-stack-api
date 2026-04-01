import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { ReputationHistory } from '../reputation/entities/reputation-history.entity';
import { Post } from '../post/entities/post.entity';
import { Answer } from '../answer/entities/answer.entity';
import { Tag } from '../tag/entities/tag.entity';
import {
  LeaderboardPeriod,
  LeaderboardResponseDto,
  TagChampionUserDto,
  TagChampionsResponseDto,
} from './dto/leaderboard.dto';

type RankRow = {
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  score: number;
};

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(ReputationHistory)
    private readonly repHistoryRepo: Repository<ReputationHistory>,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(Answer)
    private readonly answerRepo: Repository<Answer>,
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
  ) {}

  async getLeaderboard(period: LeaderboardPeriod): Promise<LeaderboardResponseDto> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [today, yesterday] = await Promise.all([
      this.fetchRankedUsers(period, null, 10),
      this.fetchRankedUsers(period, todayStart, 20),
    ]);

    const yesterdayMap = new Map(yesterday.map((r, i) => [r.userId, i + 1]));

    return {
      period,
      data: today.map((row, i) => {
        const todayRank = i + 1;
        const yesterdayRank = yesterdayMap.get(row.userId) ?? null;
        return {
          rank: todayRank,
          rankChange: yesterdayRank !== null ? yesterdayRank - todayRank : null,
          userId: row.userId,
          username: row.username,
          displayName: row.displayName,
          avatarUrl: row.avatarUrl,
          score: row.score,
        };
      }),
    };
  }

  async getTagChampions(): Promise<TagChampionsResponseDto> {
    // Placeholder — implemented in Task 4
    return { data: [] };
  }

  private async fetchRankedUsers(
    period: LeaderboardPeriod,
    cutoff: Date | null,
    limit: number,
  ): Promise<RankRow[]> {
    if (period === 'all_time') {
      return this.fetchAllTimeRanked(cutoff, limit);
    }
    const days = period === 'weekly' ? 7 : 30;
    return this.fetchPeriodRanked(days, cutoff, limit);
  }

  private async fetchAllTimeRanked(cutoff: Date | null, limit: number): Promise<RankRow[]> {
    if (cutoff === null) {
      const users = await this.userRepo.find({
        where: { isActive: true },
        order: { reputation: 'DESC' },
        take: limit,
        select: ['id', 'username', 'displayName', 'avatarUrl', 'reputation'],
      });
      return users.map(u => ({
        userId: u.id,
        username: u.username,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
        score: u.reputation,
      }));
    }

    const users = await this.userRepo.find({
      where: { isActive: true },
      order: { reputation: 'DESC' },
      take: limit * 2,
      select: ['id', 'username', 'displayName', 'avatarUrl', 'reputation'],
    });
    if (users.length === 0) return [];

    const gains = await this.repHistoryRepo
      .createQueryBuilder('rh')
      .select('rh.userId', 'userId')
      .addSelect('SUM(rh.change)', 'gains')
      .where('rh.userId IN (:...ids)', { ids: users.map(u => u.id) })
      .andWhere('rh.createdAt >= :cutoff', { cutoff })
      .groupBy('rh.userId')
      .getRawMany<{ userId: string; gains: string }>();

    const gainsMap = new Map(gains.map(g => [g.userId, Number(g.gains)]));

    return users
      .map(u => ({
        userId: u.id,
        username: u.username,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
        score: u.reputation - (gainsMap.get(u.id) ?? 0),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private async fetchPeriodRanked(
    days: number,
    cutoff: Date | null,
    limit: number,
  ): Promise<RankRow[]> {
    const end = cutoff ?? new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);

    const rows = await this.repHistoryRepo
      .createQueryBuilder('rh')
      .select('rh.userId', 'userId')
      .addSelect('SUM(rh.change)', 'score')
      .where('rh.createdAt >= :start', { start })
      .andWhere('rh.createdAt < :end', { end })
      .groupBy('rh.userId')
      .orderBy('score', 'DESC')
      .limit(limit)
      .getRawMany<{ userId: string; score: string }>();

    if (rows.length === 0) return [];

    const users = await this.userRepo.find({
      where: { id: In(rows.map(r => r.userId)), isActive: true },
      select: ['id', 'username', 'displayName', 'avatarUrl'],
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    return rows
      .filter(r => userMap.has(r.userId))
      .map(r => {
        const u = userMap.get(r.userId)!;
        return {
          userId: u.id,
          username: u.username,
          displayName: u.displayName,
          avatarUrl: u.avatarUrl,
          score: Number(r.score),
        };
      });
  }
}
