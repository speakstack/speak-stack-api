import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class TagLanguageDto {
  @ApiProperty() id: string;
  @ApiProperty() code: string;
  @ApiProperty() name: string;
}

export class TagRecentPostDto {
  @ApiProperty() id: string;
  @ApiProperty() title: string;
  @ApiProperty() score: number;
  @ApiProperty() answerCount: number;
  @ApiProperty() createdAt: Date;
}

export class TagTopContributorDto {
  @ApiProperty() id: string;
  @ApiProperty() displayName: string;
  @ApiProperty({ nullable: true }) avatarUrl: string | null;
  @ApiProperty() answerCount: number;
}

export class TagDetailResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() slug: string;
  @ApiProperty({ nullable: true }) description: string | null;
  @ApiProperty() color: string;
  @ApiProperty() postsCount: number;
  @ApiProperty() followersCount: number;
  @ApiPropertyOptional({ type: TagLanguageDto, nullable: true })
  language: TagLanguageDto | null;
  @ApiProperty({ type: [TagRecentPostDto] }) recentPosts: TagRecentPostDto[];
  @ApiProperty({ type: [TagTopContributorDto] })
  topContributors: TagTopContributorDto[];
}
