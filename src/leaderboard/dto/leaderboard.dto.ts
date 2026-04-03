export type LeaderboardPeriod = 'all_time' | 'weekly' | 'monthly';

export class LeaderboardEntryDto {
  rank: number;
  rankChange: number | null;
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  score: number;
}

export class LeaderboardResponseDto {
  data: LeaderboardEntryDto[];
}

export class TagChampionUserDto {
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  contributionCount: number;
}

export class TagChampionDto {
  tagId: string;
  tagName: string;
  tagSlug: string;
  tagColor: string;
  champion: TagChampionUserDto | null;
}

export class TagChampionsResponseDto {
  data: TagChampionDto[];
}
