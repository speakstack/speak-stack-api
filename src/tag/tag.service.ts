import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Tag } from "./entities/tag.entity";
import { Post } from "../post/entities/post.entity";
import { Answer } from "../answer/entities/answer.entity";
import { AppException } from "../common/exceptions/app.exception";
import { ErrorCode } from "../common/enums/error-code.enum";
import {
  TagDetailResponseDto,
  TagRecentPostDto,
  TagTopContributorDto,
} from "./dto/tag.dto";

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
  ) {}

  async findAll(language?: string, scope?: string): Promise<Tag[]> {
    const qb = this.tagRepository
      .createQueryBuilder("tag")
      .leftJoinAndSelect("tag.language", "language");
    if (scope === "global") {
      qb.andWhere("tag.languageId IS NULL");
    } else if (language) {
      qb.andWhere("language.code = :language", { language });
    }
    qb.orderBy("tag.name", "ASC");
    return qb.getMany();
  }

  async findBySlug(slug: string): Promise<TagDetailResponseDto> {
    const [tag, recentPosts, topContributors] = await Promise.all([
      this.findTag(slug),
      this.findRecentPosts(slug),
      this.findTopContributors(slug),
    ]);

    if (!tag) {
      throw new AppException(ErrorCode.TAG_NOT_FOUND);
    }

    return {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      description: tag.description,
      color: tag.color,
      postsCount: tag.postsCount,
      followersCount: tag.followersCount,
      language: tag.language
        ? {
            id: tag.language.id,
            code: tag.language.code,
            name: tag.language.name,
          }
        : null,
      recentPosts,
      topContributors,
    };
  }

  private async findTag(slug: string): Promise<Tag | null> {
    return this.tagRepository.findOne({
      where: { slug },
      relations: ["language"],
    });
  }

  private async findRecentPosts(slug: string): Promise<TagRecentPostDto[]> {
    const posts = await this.postRepository
      .createQueryBuilder("post")
      .innerJoin("post.tags", "tag", "tag.slug = :slug", { slug })
      .where("post.isDeleted = false")
      .orderBy("post.createdAt", "DESC")
      .select([
        "post.id",
        "post.title",
        "post.score",
        "post.answerCount",
        "post.createdAt",
      ])
      .take(5)
      .getMany();

    return posts.map((p) => ({
      id: p.id,
      title: p.title,
      score: p.score,
      answerCount: p.answerCount,
      createdAt: p.createdAt,
    }));
  }

  private async findTopContributors(
    slug: string,
  ): Promise<TagTopContributorDto[]> {
    const contributors = await this.answerRepository
      .createQueryBuilder("answer")
      .innerJoin("answer.post", "post")
      .innerJoin("post.tags", "tag", "tag.slug = :slug", { slug })
      .innerJoin("answer.author", "author")
      .where("answer.isDeleted = false")
      .andWhere("post.isDeleted = false")
      .select("author.id", "id")
      .addSelect("author.display_name", "displayName")
      .addSelect("author.avatar_url", "avatarUrl")
      .addSelect("COUNT(answer.id)", "answerCount")
      .groupBy("author.id")
      .addGroupBy("author.display_name")
      .addGroupBy("author.avatar_url")
      .orderBy("COUNT(answer.id)", "DESC")
      .limit(3)
      .getRawMany();

    return contributors.map((c) => ({
      id: c.id,
      displayName: c.displayName,
      avatarUrl: c.avatarUrl,
      answerCount: Number(c.answerCount),
    }));
  }
}
