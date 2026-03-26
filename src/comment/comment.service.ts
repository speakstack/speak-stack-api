import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Comment } from "./entities/comment.entity";
import { Answer } from "../answer/entities/answer.entity";
import { User } from "../user/entities/user.entity";
import { ReputationHistory } from "../reputation/entities/reputation-history.entity";
import { AppException } from "../common/exceptions/app.exception";
import { ErrorCode } from "../common/enums/error-code.enum";
import { sanitizeContent } from "../common/utils/sanitize";
import {
  CommentListResponseDto,
  CommentResponseDto,
  CreateCommentDto,
  ListCommentsQueryDto,
  UpdateCommentDto,
} from "./dto/comment.dto";
import { buildPagination } from "../common/dto/pagination.dto";

const COMMENT_CREATED_REP = 2;

@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name);

  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ReputationHistory)
    private readonly reputationHistoryRepository: Repository<ReputationHistory>,
    private readonly dataSource: DataSource,
  ) {}

  async createComment(
    userId: string,
    answerId: string,
    dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    const answer = await this.answerRepository.findOne({
      where: { id: answerId, isDeleted: false },
    });
    if (!answer) {
      throw new AppException(ErrorCode.ANSWER_NOT_FOUND);
    }

    const sanitizedContent = sanitizeContent(dto.content);

    const result = await this.dataSource.transaction(async (manager) => {
      const comment = manager.create(Comment, {
        answerId,
        userId,
        content: sanitizedContent,
      });
      const savedComment = await manager.save(Comment, comment);

      await manager.increment(Answer, { id: answerId }, "commentCount", 1);
      await manager.increment(
        User,
        { id: userId },
        "reputation",
        COMMENT_CREATED_REP,
      );

      await manager.save(ReputationHistory, {
        userId,
        event: "comment_created",
        change: COMMENT_CREATED_REP,
        relatedAnswerId: answerId,
        relatedCommentId: savedComment.id,
      });

      return savedComment;
    });

    const comment = await this.commentRepository.findOne({
      where: { id: result.id },
      relations: ["user"],
    });
    this.logger.log(
      `Comment ${comment!.id} created by user ${userId} on answer ${answerId}`,
    );
    return this.toCommentResponse(comment!);
  }

  async listComments(
    answerId: string,
    query: ListCommentsQueryDto,
  ): Promise<CommentListResponseDto> {
    const answer = await this.answerRepository.findOne({
      where: { id: answerId },
    });
    if (!answer) {
      throw new AppException(ErrorCode.ANSWER_NOT_FOUND);
    }

    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 20));
    const offset = (page - 1) * limit;

    const [comments, total] = await this.commentRepository
      .createQueryBuilder("comment")
      .leftJoinAndSelect("comment.user", "user")
      .where("comment.answerId = :answerId", { answerId })
      .orderBy("comment.createdAt", "ASC")
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      comments: comments.map((c) => this.toCommentResponse(c)),
      pagination: buildPagination(page, limit, total),
    };
  }

  async updateComment(
    userId: string,
    answerId: string,
    commentId: string,
    dto: UpdateCommentDto,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, answerId, isDeleted: false },
      relations: ["user"],
    });
    if (!comment) {
      throw new AppException(ErrorCode.COMMENT_NOT_FOUND);
    }
    if (comment.userId !== userId) {
      throw new AppException(ErrorCode.FORBIDDEN);
    }

    comment.content = sanitizeContent(dto.content);
    comment.editedAt = new Date();
    await this.commentRepository.save(comment);

    this.logger.log(`Comment ${commentId} updated by user ${userId}`);
    return this.toCommentResponse(comment);
  }

  async deleteComment(
    userId: string,
    answerId: string,
    commentId: string,
  ): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, answerId, isDeleted: false },
    });
    if (!comment) {
      throw new AppException(ErrorCode.COMMENT_NOT_FOUND);
    }
    if (comment.userId !== userId) {
      throw new AppException(ErrorCode.FORBIDDEN);
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.update(Comment, commentId, {
        isDeleted: true,
        deletedAt: new Date(),
      });
      await manager.decrement(Answer, { id: answerId }, "commentCount", 1);
      await manager
        .createQueryBuilder()
        .update(User)
        .set({
          reputation: () =>
            `GREATEST(0, reputation - ${COMMENT_CREATED_REP})`,
        })
        .where("id = :id", { id: comment.userId })
        .execute();
      await manager.save(ReputationHistory, {
        userId: comment.userId,
        event: "comment_deleted",
        change: -COMMENT_CREATED_REP,
        relatedAnswerId: answerId,
        relatedCommentId: commentId,
      });
    });

    this.logger.log(`Comment ${commentId} deleted by user ${userId}`);
  }

  private toCommentResponse(comment: Comment): CommentResponseDto {
    return {
      id: comment.id,
      content: comment.isDeleted ? "[deleted]" : comment.content,
      author: {
        id: comment.user.id,
        username: comment.user.username,
        displayName: comment.user.displayName,
        avatarUrl: comment.user.avatarUrl,
      },
      editedAt: comment.editedAt,
      isDeleted: comment.isDeleted,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }
}
