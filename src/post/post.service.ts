import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntityManager, In, Repository } from "typeorm";
import { randomUUID } from "crypto";
import * as path from "path";
import * as fs from "fs/promises";
import { Post, PostStatus } from "./entities/post.entity";
import {
  PostAttachment,
  AttachmentType,
} from "./entities/post-attachment.entity";
import { Answer } from "../answer/entities/answer.entity";
import { Tag } from "../tag/entities/tag.entity";
import { User } from "../user/entities/user.entity";
import { Language } from "../language/entities/language.entity";
import { ReputationHistory } from "../reputation/entities/reputation-history.entity";
import { AppException } from "../common/exceptions/app.exception";
import { ErrorCode } from "../common/enums/error-code.enum";
import { sanitizeContent } from "../common/utils/sanitize";
import {
  CreatePostDto,
  ListPostsQueryDto,
  mapAttachmentToDto,
  PostAttachmentResponseDto,
  PostDetailResponseDto,
  PostListResponseDto,
  PostResponseDto,
  PostSort,
  UpdatePostDto,
} from "./dto/post.dto";
import { buildPagination } from "../common/dto/pagination.dto";
import { VoteService } from "../vote/vote.service";
import { BadgeService } from "../badge/badge.service";
import { BadgeTriggerType } from "../badge/entities/badge.entity";

const CONTENT_TRUNCATE_LENGTH = 200;
const EDIT_WINDOW_HOURS = 24;
const POST_CREATED_REP = 5;
const POST_DELETED_REP = -10;

const MAX_ATTACHMENTS_PER_POST = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ATTACHMENTS_DIR = path.join(process.cwd(), "uploads", "post-attachments");

const ALLOWED_MIME_TYPES: Record<string, AttachmentType> = {
  "image/jpeg": AttachmentType.IMAGE,
  "image/png": AttachmentType.IMAGE,
  "image/webp": AttachmentType.IMAGE,
  "image/gif": AttachmentType.IMAGE,
  "application/pdf": AttachmentType.DOCUMENT,
  "application/msword": AttachmentType.DOCUMENT,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    AttachmentType.DOCUMENT,
  "text/plain": AttachmentType.DOCUMENT,
  "audio/mpeg": AttachmentType.AUDIO,
  "audio/wav": AttachmentType.AUDIO,
  "audio/ogg": AttachmentType.AUDIO,
  "audio/webm": AttachmentType.AUDIO,
};

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(PostAttachment)
    private readonly attachmentRepository: Repository<PostAttachment>,
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
    @InjectRepository(ReputationHistory)
    private readonly reputationHistoryRepository: Repository<ReputationHistory>,
    private readonly dataSource: DataSource,
    private readonly voteService: VoteService,
    private readonly badgeService: BadgeService,
  ) {}

  async createPost(
    userId: string,
    dto: CreatePostDto,
  ): Promise<PostResponseDto> {
    const language = await this.languageRepository.findOne({
      where: { id: dto.targetLanguageId },
    });
    if (!language) {
      throw new AppException(ErrorCode.LANGUAGE_NOT_FOUND);
    }
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
        targetLanguageId: dto.targetLanguageId,
        tags,
      });
      const savedPost = await manager.save(Post, post);

      for (const tag of tags) {
        await manager.increment(Tag, { id: tag.id }, "postsCount", 1);
      }

      await manager.increment(User, { id: userId }, "postsCount", 1);
      await manager.increment(
        User,
        { id: userId },
        "reputation",
        POST_CREATED_REP,
      );

      await manager.save(ReputationHistory, {
        userId,
        event: "post_created",
        change: POST_CREATED_REP,
        relatedPostId: savedPost.id,
      });

      await this.badgeService.checkAndAwardBadges(
        userId,
        [BadgeTriggerType.FIRST_POST, BadgeTriggerType.POST_COUNT],
        manager,
      );

      return savedPost;
    });

    const post = await this.findPostWithRelations(result.id);
    this.logger.log(`Post ${post.id} created by user ${userId}`);
    return this.toPostResponse(post);
  }

  async listPosts(
    query: ListPostsQueryDto,
    userId?: string,
  ): Promise<PostListResponseDto> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 20));
    const offset = (page - 1) * limit;

    const qb = this.postRepository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.author", "author")
      .leftJoinAndSelect("post.tags", "tags")
      .leftJoinAndSelect("post.targetLanguage", "targetLanguage")
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
        `to_tsvector('simple', post.title || ' ' || post.content) @@ plainto_tsquery('simple', :search)`,
        { search: query.search },
      );
    }

    if (query.language) {
      qb.andWhere("targetLanguage.code = :language", {
        language: query.language,
      });
    }

    if (query.sort === PostSort.TOP) {
      qb.orderBy("post.score", "DESC");
    } else if (query.sort === PostSort.UNANSWERED) {
      qb.andWhere("post.answerCount = :answerCount", { answerCount: 0 });
      qb.orderBy("post.createdAt", "DESC");
    } else {
      qb.orderBy("post.createdAt", "DESC");
    }

    const [posts, total] = await qb.skip(offset).take(limit).getManyAndCount();

    const postIds = posts.map((p) => p.id);
    const voteMap = userId
      ? await this.voteService.getUserPostVotes(userId, postIds)
      : {};
    const attachmentMap = await this.getAttachmentsForPosts(postIds);

    return {
      posts: posts.map((p) =>
        this.toPostResponse(p, true, voteMap[p.id] ?? 0, attachmentMap[p.id] ?? []),
      ),
      pagination: buildPagination(page, limit, total),
    };
  }

  async getPost(id: string, userId?: string): Promise<PostDetailResponseDto> {
    const post = await this.findPostWithRelations(id);
    this.postRepository.increment({ id }, "viewCount", 1).catch(() => {});
    const userVote = userId
      ? await this.voteService.getUserPostVote(userId, id)
      : 0;
    return this.toPostDetailResponse(post, userVote);
  }

  async updatePost(
    userId: string,
    id: string,
    dto: UpdatePostDto,
  ): Promise<PostDetailResponseDto> {
    const post = await this.findPostWithRelations(id);
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
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (post.authorId !== userId && user?.role !== "admin") {
      throw new AppException(ErrorCode.FORBIDDEN);
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.update(Post, id, {
        isDeleted: true,
        deletedAt: new Date(),
      });

      const authorCountMap = await this.getAnswerAuthorCounts(manager, id);
      if (authorCountMap.size > 0) {
        await manager
          .createQueryBuilder()
          .update(Answer)
          .set({ isDeleted: true, deletedAt: () => "NOW()" })
          .where("postId = :postId AND isDeleted = false", { postId: id })
          .execute();
        for (const [authorId, count] of authorCountMap) {
          await manager
            .createQueryBuilder()
            .update(User)
            .set({
              answersCount: () => `GREATEST(0, answers_count - ${count})`,
            })
            .where("id = :id", { id: authorId })
            .execute();
        }
      }

      const tagIds = post.tags.map((t) => t.id);
      if (tagIds.length > 0) {
        await manager
          .createQueryBuilder()
          .update(Tag)
          .set({ postsCount: () => "GREATEST(0, posts_count - 1)" })
          .where("id IN (:...tagIds)", { tagIds })
          .execute();
      }

      await manager
        .createQueryBuilder()
        .update(User)
        .set({ postsCount: () => "GREATEST(0, posts_count - 1)" })
        .where("id = :id", { id: post.authorId })
        .execute();

      await manager
        .createQueryBuilder()
        .update(User)
        .set({
          reputation: () => `GREATEST(0, reputation + ${POST_DELETED_REP})`,
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

  private async getAnswerAuthorCounts(
    manager: EntityManager,
    postId: string,
  ): Promise<Map<string, number>> {
    const rows: { authorId: string; count: string }[] = await manager
      .createQueryBuilder()
      .select("answer.authorId", "authorId")
      .addSelect("COUNT(*)", "count")
      .from(Answer, "answer")
      .where("answer.postId = :postId AND answer.isDeleted = false", { postId })
      .groupBy("answer.authorId")
      .getRawMany();
    return new Map(rows.map((r) => [r.authorId, Number(r.count)]));
  }

  async findPostWithRelations(id: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id, isDeleted: false },
      relations: ["author", "tags", "targetLanguage", "attachments"],
    });
    if (!post) {
      throw new AppException(ErrorCode.POST_NOT_FOUND);
    }
    return post;
  }

  private toPostResponse(
    post: Post,
    truncateContent = false,
    userVote: number = 0,
    attachments: PostAttachmentResponseDto[] = [],
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
      targetLanguage: {
        id: post.targetLanguage.id,
        code: post.targetLanguage.code,
        name: post.targetLanguage.name,
      },
      score: post.score,
      userVote,
      answerCount: post.answerCount,
      viewCount: post.viewCount,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      attachments,
    };
  }

  private toPostDetailResponse(
    post: Post,
    userVote: number = 0,
  ): PostDetailResponseDto {
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
      targetLanguage: {
        id: post.targetLanguage.id,
        code: post.targetLanguage.code,
        name: post.targetLanguage.name,
      },
      acceptedAnswerId: post.acceptedAnswerId,
      attachments: (post.attachments || []).map(mapAttachmentToDto),
      score: post.score,
      userVote,
      answerCount: post.answerCount,
      viewCount: post.viewCount,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  async uploadAttachments(
    userId: string,
    postId: string,
    files: Express.Multer.File[],
  ): Promise<PostAttachmentResponseDto[]> {
    const post = await this.postRepository.findOne({
      where: { id: postId, isDeleted: false },
    });
    if (!post) {
      throw new AppException(ErrorCode.POST_NOT_FOUND);
    }
    if (post.authorId !== userId) {
      throw new AppException(ErrorCode.FORBIDDEN);
    }

    for (const file of files) {
      if (!ALLOWED_MIME_TYPES[file.mimetype]) {
        throw new AppException(ErrorCode.INVALID_FILE_TYPE);
      }
      if (file.size > MAX_FILE_SIZE) {
        throw new AppException(ErrorCode.FILE_TOO_LARGE);
      }
    }

    const existingCount = await this.attachmentRepository.count({
      where: { postId },
    });
    if (existingCount + files.length > MAX_ATTACHMENTS_PER_POST) {
      throw new AppException(ErrorCode.ATTACHMENT_LIMIT_EXCEEDED);
    }

    const dir = path.join(ATTACHMENTS_DIR, postId);
    await fs.mkdir(dir, { recursive: true });

    const attachments: PostAttachment[] = [];
    for (const file of files) {
      const ext = path.extname(file.originalname);
      const filename = `${randomUUID()}${ext}`;
      const filepath = path.join(dir, filename);

      await fs.writeFile(filepath, file.buffer);

      const attachment = this.attachmentRepository.create({
        postId,
        originalName: file.originalname,
        storagePath: `/uploads/post-attachments/${postId}/${filename}`,
        mimeType: file.mimetype,
        size: file.size,
        type: ALLOWED_MIME_TYPES[file.mimetype],
      });
      attachments.push(await this.attachmentRepository.save(attachment));
    }

    this.logger.log(
      `${files.length} attachment(s) uploaded for post ${postId} by user ${userId}`,
    );
    return attachments.map(mapAttachmentToDto);
  }

  async deleteAttachment(
    userId: string,
    postId: string,
    attachmentId: string,
  ): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { id: postId, isDeleted: false },
    });
    if (!post) {
      throw new AppException(ErrorCode.POST_NOT_FOUND);
    }
    if (post.authorId !== userId) {
      throw new AppException(ErrorCode.FORBIDDEN);
    }

    const attachment = await this.attachmentRepository.findOne({
      where: { id: attachmentId, postId },
    });
    if (!attachment) {
      throw new AppException(ErrorCode.ATTACHMENT_NOT_FOUND);
    }

    const filepath = path.join(process.cwd(), attachment.storagePath);
    await fs.unlink(filepath).catch(() => {});

    await this.attachmentRepository.remove(attachment);
    this.logger.log(
      `Attachment ${attachmentId} deleted from post ${postId} by user ${userId}`,
    );
  }

  private async getAttachmentsForPosts(
    postIds: string[],
  ): Promise<Record<string, PostAttachmentResponseDto[]>> {
    if (postIds.length === 0) return {};
    const attachments = await this.attachmentRepository.find({
      where: { postId: In(postIds) },
      order: { createdAt: "ASC" },
    });
    const map: Record<string, PostAttachmentResponseDto[]> = {};
    for (const a of attachments) {
      map[a.postId] ??= [];
      map[a.postId].push(mapAttachmentToDto(a));
    }
    return map;
  }

  private truncateContent(content: string): string {
    if (content.length <= CONTENT_TRUNCATE_LENGTH) {
      return content;
    }
    return content.substring(0, CONTENT_TRUNCATE_LENGTH) + "...";
  }
}
