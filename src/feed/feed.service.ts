import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Post } from "../post/entities/post.entity";
import { VoteService } from "../vote/vote.service";
import { PostResponseDto } from "../post/dto/post.dto";
import { AppException } from "../common/exceptions/app.exception";
import { ErrorCode } from "../common/enums/error-code.enum";
import { FeedQueryDto } from "./dto/feed-query.dto";
import { FeedResponseDto } from "./dto/feed-response.dto";
import { UserLanguageRelation } from "../user-language/entities/user-language.entity";

// Feed pagination
const MAX_FEED_LIMIT = 50;
const DEFAULT_FEED_LIMIT = 20;
const CONTENT_PREVIEW_LENGTH = 200;

// Engagement weights
const UPVOTE_WEIGHT = 3;
const ANSWER_WEIGHT = 5;
const COMMENT_WEIGHT = 2;
const VIEW_WEIGHT = 0.1;

// Language boost multipliers
const LEARNING_BOOST = 3;
const CAN_HELP_BOOST = 2;
const NATIVE_BOOST = 1.5;

// Tag boost
const TAG_BOOST_MAX = 1.0; // added to base 1.0, so max is x2
const TAG_INTERACTION_CAP = 10;

// Freshness decay
const DECAY_EXPONENT = 1.5;
const SECONDS_PER_DAY = 86400;

// Tag frequency window (days)
const TAG_FREQ_WINDOW_DAYS = 30;

@Injectable()
export class FeedService {
  private readonly logger = new Logger(FeedService.name);

  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    private readonly voteService: VoteService,
  ) {}

  async getForYou(userId: string, query: FeedQueryDto): Promise<FeedResponseDto> {
    const limit = Math.min(MAX_FEED_LIMIT, Math.max(1, query.limit || DEFAULT_FEED_LIMIT));

    let cursorScore: number | null = null;
    let cursorId: string | null = null;
    let pinnedEpoch: number | null = null;

    if (query.cursor) {
      try {
        const decoded = Buffer.from(query.cursor, "base64").toString("utf-8");
        const [scoreStr, id, epochStr] = decoded.split(":");
        const score = parseFloat(scoreStr);
        const epoch = parseInt(epochStr, 10);
        if (isNaN(score) || !id || isNaN(epoch)) {
          throw new Error();
        }
        cursorScore = score;
        cursorId = id;
        pinnedEpoch = epoch;
      } catch {
        throw new AppException(ErrorCode.VALIDATION_ERROR, { cursor: "Invalid cursor" });
      }
    }

    // Pin timestamp for stable scoring across pages
    const nowEpoch = pinnedEpoch ?? Math.floor(Date.now() / 1000);
    const scoringSql = this.buildScoringExpression(nowEpoch);

    const qb = this.postRepo
      .createQueryBuilder("p")
      .select("p.id", "id")
      .addSelect("p.type", "type")
      .addSelect("p.status", "status")
      .addSelect("p.title", "title")
      .addSelect("p.content", "content")
      .addSelect("p.score", "score")
      .addSelect("p.answer_count", "answerCount")
      .addSelect("p.view_count", "viewCount")
      .addSelect("p.created_at", "createdAt")
      .addSelect("p.updated_at", "updatedAt")
      .addSelect("p.author_id", "authorId")
      .addSelect("p.target_language_id", "targetLanguageId")
      // Author fields
      .addSelect("author.id", "author_id")
      .addSelect("author.username", "author_username")
      .addSelect("author.display_name", "author_displayName")
      .addSelect("author.avatar_url", "author_avatarUrl")
      // Language fields
      .addSelect("lang.id", "lang_id")
      .addSelect("lang.code", "lang_code")
      .addSelect("lang.name", "lang_name")
      // Scoring formula
      .addSelect(scoringSql, "final_score")
      // Joins
      .innerJoin("p.author", "author")
      .innerJoin("p.targetLanguage", "lang")
      .leftJoin(
        "user_languages",
        "ul",
        "ul.language_id = p.target_language_id AND ul.user_id = :userId",
        { userId },
      )
      .leftJoin(
        (subQuery) =>
          subQuery
            .select("pt.post_id", "post_id")
            .addSelect("MAX(utf.freq)", "freq")
            .from("post_tags", "pt")
            .innerJoin(
              (tagFreqQuery) =>
                tagFreqQuery
                  .select("t.id", "tag_id")
                  .addSelect("COUNT(*)", "freq")
                  .from("post_tags", "pt2")
                  .innerJoin("tags", "t", "t.id = pt2.tag_id")
                  .leftJoin(
                    "post_votes",
                    "pv",
                    "pv.post_id = pt2.post_id AND pv.user_id = :userId",
                  )
                  .leftJoin(
                    "posts",
                    "up",
                    "up.id = pt2.post_id AND up.author_id = :userId",
                  )
                  .where("(pv.id IS NOT NULL OR up.id IS NOT NULL)")
                  .andWhere(
                    `COALESCE(pv.created_at, up.created_at) > NOW() - INTERVAL '${TAG_FREQ_WINDOW_DAYS} days'`,
                  )
                  .groupBy("t.id"),
              "utf",
              "utf.tag_id = pt.tag_id",
            )
            .groupBy("pt.post_id"),
        "tag_scores",
        "tag_scores.post_id = p.id",
      )
      // Exclusions
      .where("p.is_deleted = false")
      .andWhere("p.author_id != :userId", { userId })
      .andWhere(
        `p.id NOT IN (
          SELECT pv.post_id FROM post_votes pv WHERE pv.user_id = :userId
          UNION
          SELECT a.post_id FROM answers a WHERE a.author_id = :userId
          UNION
          SELECT DISTINCT a2.post_id FROM comments c
            INNER JOIN answers a2 ON a2.id = c.answer_id
            WHERE c.user_id = :userId
        )`,
      )
      .orderBy("final_score", "DESC")
      .addOrderBy("p.id", "DESC")
      .limit(limit + 1);

    if (cursorScore !== null && cursorId) {
      qb.andWhere(
        `${scoringSql} < :cursorScore OR (${scoringSql} = :cursorScore AND p.id < :cursorId)`,
        { cursorScore, cursorId },
      );
    }

    const rows = await qb.getRawMany();

    const hasMore = rows.length > limit;
    const resultRows = hasMore ? rows.slice(0, limit) : rows;

    // Fetch tags for returned posts
    const postIds = resultRows.map((r: { id: string }) => r.id);
    const tagMap = await this.getTagsForPosts(postIds);

    // Fetch user votes
    const voteMap = await this.voteService.getUserPostVotes(userId, postIds);

    const posts: PostResponseDto[] = resultRows.map((r: Record<string, unknown>) => ({
      id: r.id as string,
      type: r.type as string,
      status: r.status as string,
      title: r.title as string,
      content: this.truncateContent(r.content as string),
      author: {
        id: r.author_id as string,
        username: r.author_username as string,
        displayName: (r.author_displayName as string) || null,
        avatarUrl: (r.author_avatarUrl as string) || null,
      },
      tags: tagMap[r.id as string] || [],
      targetLanguage: {
        id: r.lang_id as string,
        code: r.lang_code as string,
        name: r.lang_name as string,
      },
      score: Number(r.score),
      userVote: voteMap[r.id as string] ?? 0,
      answerCount: Number(r.answerCount),
      viewCount: Number(r.viewCount),
      createdAt: new Date(r.createdAt as string),
      updatedAt: new Date(r.updatedAt as string),
    }));

    let nextCursor: string | null = null;
    if (hasMore && resultRows.length > 0) {
      const lastRow = resultRows[resultRows.length - 1];
      const cursorValue = `${lastRow.final_score}:${lastRow.id}:${nowEpoch}`;
      nextCursor = Buffer.from(cursorValue).toString("base64");
    }

    return { posts, nextCursor };
  }

  private buildScoringExpression(nowEpoch: number): string {
    return `(
      (p.upvote_count * ${UPVOTE_WEIGHT} + p.answer_count * ${ANSWER_WEIGHT} + p.comment_count * ${COMMENT_WEIGHT} + p.view_count * ${VIEW_WEIGHT})
      * COALESCE(CASE ul.relation
          WHEN '${UserLanguageRelation.LEARNING}' THEN ${LEARNING_BOOST}
          WHEN '${UserLanguageRelation.CAN_HELP}' THEN ${CAN_HELP_BOOST}
          WHEN '${UserLanguageRelation.NATIVE}' THEN ${NATIVE_BOOST}
          ELSE 1
        END, 1)
      * (1 + LEAST(COALESCE(tag_scores.freq, 0) / ${TAG_INTERACTION_CAP}.0, ${TAG_BOOST_MAX}))
      * (1.0 / POWER(1 + (${nowEpoch} - EXTRACT(EPOCH FROM p.created_at)) / ${SECONDS_PER_DAY}, ${DECAY_EXPONENT}))
    )`;
  }

  private async getTagsForPosts(
    postIds: string[],
  ): Promise<Record<string, { id: string; name: string; slug: string; color: string }[]>> {
    if (postIds.length === 0) return {};

    const rows = await this.postRepo
      .createQueryBuilder("p")
      .innerJoinAndSelect("p.tags", "t")
      .where("p.id IN (:...postIds)", { postIds })
      .select(["p.id", "t.id", "t.name", "t.slug", "t.color"])
      .getMany();

    const map: Record<string, { id: string; name: string; slug: string; color: string }[]> = {};
    for (const post of rows) {
      map[post.id] = post.tags.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        color: t.color,
      }));
    }
    return map;
  }

  private truncateContent(content: string): string {
    if (content.length <= CONTENT_PREVIEW_LENGTH) return content;
    return content.substring(0, CONTENT_PREVIEW_LENGTH) + "...";
  }
}
