import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, In, Repository } from "typeorm";
import { Post, PostStatus } from "./entities/post.entity";
import { Tag } from "../tag/entities/tag.entity";
import { User } from "../user/entities/user.entity";
import { ReputationHistory } from "../reputation/entities/reputation-history.entity";
import { AppException } from "../common/exceptions/app.exception";
import { ErrorCode } from "../common/enums/error-code.enum";
import { sanitizeContent } from "../common/utils/sanitize";
import {
  CreatePostDto,
  ListPostsQueryDto,
  PostDetailResponseDto,
  PostListResponseDto,
  PostResponseDto,
  UpdatePostDto,
} from "./dto/post.dto";

const CONTENT_TRUNCATE_LENGTH = 200;
const EDIT_WINDOW_HOURS = 24;
const POST_CREATED_REP = 5;
const POST_DELETED_REP = -10;

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ReputationHistory)
    private readonly reputationHistoryRepository: Repository<ReputationHistory>,
    private readonly dataSource: DataSource,
  ) {}

  async createPost(
    userId: string,
    dto: CreatePostDto,
  ): Promise<PostResponseDto> {
    const tags = await this.tagRepository.findBy({ id: In(dto.tagIds) });
    if (tags.length !== dto.tagIds.length) {
      throw new AppException(ErrorCode.TAG_NOT_FOUND);
    }

    const sanitizedContent = sanitizeContent(dto.content);

    const result = await this.dataSource.transaction(async (manager) => {
      const post = manager.create(Post, {
        authorId: userId,
        type: dto.type,
        title: dto.title,
        content: sanitizedContent,
        tags,
      });
      const savedPost = await manager.save(Post, post);

      for (const tag of tags) {
        await manager.increment(Tag, { id: tag.id }, "postsCount", 1);
      }

      await manager.increment(User, { id: userId }, "postsCount", 1);
      await manager.increment(User, { id: userId }, "reputation", POST_CREATED_REP);

      await manager.save(ReputationHistory, {
        userId,
        event: "post_created",
        change: POST_CREATED_REP,
        relatedPostId: savedPost.id,
      });

      return savedPost;
    });

    const post = await this.findPostWithRelations(result.id);
    this.logger.log(`Post ${post.id} created by user ${userId}`);
    return this.toPostResponse(post);
  }

  async listPosts(query: ListPostsQueryDto): Promise<PostListResponseDto> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 20));
    const offset = (page - 1) * limit;

    const qb = this.postRepository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.author", "author")
      .leftJoinAndSelect("post.tags", "tags")
      .where("post.isDeleted = :isDeleted", { isDeleted: false });

    if (query.type) {
      qb.andWhere("post.type = :type", { type: query.type });
    }

    if (query.status) {
      qb.andWhere("post.status = :status", { status: query.status });
    }

    if (query.authorId) {
      qb.andWhere("post.authorId = :authorId", { authorId: query.authorId });
    }

    if (query.tags) {
      const tagSlugs = query.tags.split(",").map((s) => s.trim());
      qb.andWhere(
        `post.id IN (
          SELECT pt.post_id FROM post_tags pt
          INNER JOIN tags t ON t.id = pt.tag_id
          WHERE t.slug IN (:...tagSlugs)
        )`,
        { tagSlugs },
      );
    }

    if (query.search) {
      qb.andWhere(
        `to_tsvector('english', post.title || ' ' || post.content) @@ plainto_tsquery('english', :search)`,
        { search: query.search },
      );
    }

    if (query.sort === "top") {
      qb.orderBy("post.score", "DESC");
    } else if (query.sort === "unanswered") {
      qb.andWhere("post.answerCount = :answerCount", { answerCount: 0 });
      qb.orderBy("post.createdAt", "DESC");
    } else {
      qb.orderBy("post.createdAt", "DESC");
    }

    const [posts, total] = await qb.skip(offset).take(limit).getManyAndCount();

    return {
      posts: posts.map((p) => this.toPostResponse(p, true)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPost(id: string): Promise<PostDetailResponseDto> {
    const post = await this.findPostWithRelations(id);
    if (!post) {
      throw new AppException(ErrorCode.POST_NOT_FOUND);
    }

    // Fire-and-forget view count increment
    this.postRepository.increment({ id }, "viewCount", 1).catch(() => {});

    return this.toPostDetailResponse(post);
  }

  async updatePost(
    userId: string,
    id: string,
    dto: UpdatePostDto,
  ): Promise<PostDetailResponseDto> {
    const post = await this.findPostWithRelations(id);
    if (!post) {
      throw new AppException(ErrorCode.POST_NOT_FOUND);
    }
    if (post.authorId !== userId) {
      throw new AppException(ErrorCode.FORBIDDEN);
    }

    const hoursSinceCreation =
      (Date.now() - post.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation > EDIT_WINDOW_HOURS) {
      throw new AppException(ErrorCode.POST_EDIT_WINDOW_EXPIRED);
    }

    if (post.acceptedAnswerId) {
      throw new AppException(ErrorCode.POST_HAS_ACCEPTED_ANSWER);
    }

    if (dto.content) {
      dto.content = sanitizeContent(dto.content);
    }

    if (dto.tagIds) {
      const newTags = await this.tagRepository.findBy({ id: In(dto.tagIds) });
      if (newTags.length !== dto.tagIds.length) {
        throw new AppException(ErrorCode.TAG_NOT_FOUND);
      }

      const oldTagIds = post.tags.map((t) => t.id);
      const newTagIds = dto.tagIds;
      const removedTagIds = oldTagIds.filter((id) => !newTagIds.includes(id));
      const addedTagIds = newTagIds.filter((id) => !oldTagIds.includes(id));

      await this.dataSource.transaction(async (manager) => {
        // Remove old post_tags and add new ones via relation
        post.tags = newTags;
        if (dto.type) post.type = dto.type;
        if (dto.title) post.title = dto.title;
        if (dto.content) post.content = dto.content;
        await manager.save(Post, post);

        for (const tagId of removedTagIds) {
          await manager.decrement(Tag, { id: tagId }, "postsCount", 1);
        }
        for (const tagId of addedTagIds) {
          await manager.increment(Tag, { id: tagId }, "postsCount", 1);
        }
      });
    } else {
      if (dto.type) post.type = dto.type;
      if (dto.title) post.title = dto.title;
      if (dto.content) post.content = dto.content;
      await this.postRepository.save(post);
    }

    const updated = await this.findPostWithRelations(id);
    this.logger.log(`Post ${id} updated by user ${userId}`);
    return this.toPostDetailResponse(updated);
  }

  async deletePost(userId: string, id: string): Promise<void> {
    const post = await this.findPostWithRelations(id);
    if (!post) {
      throw new AppException(ErrorCode.POST_NOT_FOUND);
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (post.authorId !== userId && user?.role !== "admin") {
      throw new AppException(ErrorCode.FORBIDDEN);
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.update(Post, id, {
        isDeleted: true,
        deletedAt: new Date(),
      });

      for (const tag of post.tags) {
        await manager.decrement(Tag, { id: tag.id }, "postsCount", 1);
      }

      await manager.decrement(User, { id: post.authorId }, "postsCount", 1);

      await manager
        .createQueryBuilder()
        .update(User)
        .set({
          reputation: () =>
            `GREATEST(0, reputation + ${POST_DELETED_REP})`,
        })
        .where("id = :id", { id: post.authorId })
        .execute();

      await manager.save(ReputationHistory, {
        userId: post.authorId,
        event: "post_deleted",
        change: POST_DELETED_REP,
        relatedPostId: id,
      });
    });

    this.logger.log(`Post ${id} deleted by user ${userId}`);
  }

  async findPostWithRelations(id: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id, isDeleted: false },
      relations: ["author", "tags"],
    });
    if (!post) {
      throw new AppException(ErrorCode.POST_NOT_FOUND);
    }
    return post;
  }

  private toPostResponse(
    post: Post,
    truncateContent = false,
  ): PostResponseDto {
    return {
      id: post.id,
      type: post.type,
      status: post.status,
      title: post.title,
      content: truncateContent
        ? this.truncateContent(post.content)
        : post.content,
      author: {
        id: post.author.id,
        username: post.author.username,
        displayName: post.author.displayName,
        avatarUrl: post.author.avatarUrl,
      },
      tags: post.tags.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        color: t.color,
      })),
      answerCount: post.answerCount,
      viewCount: post.viewCount,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  private toPostDetailResponse(post: Post): PostDetailResponseDto {
    return {
      id: post.id,
      type: post.type,
      status: post.status,
      title: post.title,
      content: post.content,
      author: {
        id: post.author.id,
        username: post.author.username,
        displayName: post.author.displayName,
        avatarUrl: post.author.avatarUrl,
        reputation: post.author.reputation,
        role: post.author.role,
      },
      tags: post.tags.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        color: t.color,
      })),
      acceptedAnswerId: post.acceptedAnswerId,
      answerCount: post.answerCount,
      viewCount: post.viewCount,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  private truncateContent(content: string): string {
    if (content.length <= CONTENT_TRUNCATE_LENGTH) {
      return content;
    }
    return content.substring(0, CONTENT_TRUNCATE_LENGTH) + "...";
  }
}
