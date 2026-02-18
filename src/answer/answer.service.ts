import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Answer } from "./entities/answer.entity";
import { Post, PostStatus } from "../post/entities/post.entity";
import { User } from "../user/entities/user.entity";
import { ReputationHistory } from "../reputation/entities/reputation-history.entity";
import { AppException } from "../common/exceptions/app.exception";
import { ErrorCode } from "../common/enums/error-code.enum";
import { sanitizeContent } from "../common/utils/sanitize";
import {
  AnswerResponseDto,
  CreateAnswerDto,
  ListAnswersQueryDto,
  UpdateAnswerDto,
} from "./dto/answer.dto";
import { PostDetailResponseDto } from "../post/dto/post.dto";
import { PostService } from "../post/post.service";

const ANSWER_CREATED_REP = 10;
const ANSWER_ACCEPTED_REP = 15;

@Injectable()
export class AnswerService {
  private readonly logger = new Logger(AnswerService.name);

  constructor(
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ReputationHistory)
    private readonly reputationHistoryRepository: Repository<ReputationHistory>,
    private readonly dataSource: DataSource,
    private readonly postService: PostService,
  ) {}

  async createAnswer(
    userId: string,
    postId: string,
    dto: CreateAnswerDto,
  ): Promise<AnswerResponseDto> {
    const post = await this.postRepository.findOne({
      where: { id: postId, isDeleted: false },
    });
    if (!post) {
      throw new AppException(ErrorCode.POST_NOT_FOUND);
    }
    if (post.isClosed) {
      throw new AppException(ErrorCode.POST_CLOSED);
    }
    if (post.authorId === userId) {
      throw new AppException(ErrorCode.SELF_ANSWER_NOT_ALLOWED);
    }

    const sanitizedContent = sanitizeContent(dto.content);

    const result = await this.dataSource.transaction(async (manager) => {
      const answer = manager.create(Answer, {
        postId,
        authorId: userId,
        content: sanitizedContent,
      });
      const savedAnswer = await manager.save(Answer, answer);

      await manager.increment(Post, { id: postId }, "answerCount", 1);
      await manager.update(Post, postId, { lastActivityAt: new Date() });
      await manager.increment(User, { id: userId }, "answersCount", 1);
      await manager.increment(
        User,
        { id: userId },
        "reputation",
        ANSWER_CREATED_REP,
      );

      await manager.save(ReputationHistory, {
        userId,
        event: "answer_created",
        change: ANSWER_CREATED_REP,
        relatedPostId: postId,
        relatedAnswerId: savedAnswer.id,
      });

      return savedAnswer;
    });

    const answer = await this.answerRepository.findOne({
      where: { id: result.id },
      relations: ["author"],
    });
    this.logger.log(
      `Answer ${answer!.id} created by user ${userId} on post ${postId}`,
    );
    return this.toAnswerResponse(answer!);
  }

  async listAnswers(
    postId: string,
    query: ListAnswersQueryDto,
  ): Promise<AnswerResponseDto[]> {
    const qb = this.answerRepository
      .createQueryBuilder("answer")
      .leftJoinAndSelect("answer.author", "author")
      .where("answer.postId = :postId", { postId })
      .andWhere("answer.isDeleted = :isDeleted", { isDeleted: false });

    // Accepted answer always first
    if (query.sort === "new") {
      qb.orderBy("answer.isAccepted", "DESC").addOrderBy(
        "answer.createdAt",
        "DESC",
      );
    } else {
      // Default: votes
      qb.orderBy("answer.isAccepted", "DESC").addOrderBy(
        "answer.score",
        "DESC",
      );
    }

    const answers = await qb.getMany();
    return answers.map((a) => this.toAnswerResponse(a));
  }

  async updateAnswer(
    userId: string,
    id: string,
    dto: UpdateAnswerDto,
  ): Promise<AnswerResponseDto> {
    const answer = await this.answerRepository.findOne({
      where: { id, isDeleted: false },
      relations: ["author"],
    });
    if (!answer) {
      throw new AppException(ErrorCode.ANSWER_NOT_FOUND);
    }
    if (answer.authorId !== userId) {
      throw new AppException(ErrorCode.FORBIDDEN);
    }

    answer.content = sanitizeContent(dto.content);
    await this.answerRepository.save(answer);

    this.logger.log(`Answer ${id} updated by user ${userId}`);
    return this.toAnswerResponse(answer);
  }

  async deleteAnswer(userId: string, id: string): Promise<void> {
    const answer = await this.answerRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!answer) {
      throw new AppException(ErrorCode.ANSWER_NOT_FOUND);
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (answer.authorId !== userId && user?.role !== "admin") {
      throw new AppException(ErrorCode.FORBIDDEN);
    }

    if (answer.isAccepted) {
      throw new AppException(ErrorCode.CANNOT_DELETE_ACCEPTED_ANSWER);
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.update(Answer, id, {
        isDeleted: true,
        deletedAt: new Date(),
      });
      await manager.decrement(Post, { id: answer.postId }, "answerCount", 1);
      await manager.decrement(
        User,
        { id: answer.authorId },
        "answersCount",
        1,
      );
    });

    this.logger.log(`Answer ${id} deleted by user ${userId}`);
  }

  async acceptAnswer(
    userId: string,
    postId: string,
    answerId: string,
  ): Promise<PostDetailResponseDto> {
    const post = await this.postRepository.findOne({
      where: { id: postId, isDeleted: false },
    });
    if (!post) {
      throw new AppException(ErrorCode.POST_NOT_FOUND);
    }
    if (post.authorId !== userId) {
      throw new AppException(ErrorCode.FORBIDDEN);
    }

    const answer = await this.answerRepository.findOne({
      where: { id: answerId, isDeleted: false },
    });
    if (!answer || answer.postId !== postId) {
      throw new AppException(ErrorCode.ANSWER_NOT_FOUND);
    }

    await this.dataSource.transaction(async (manager) => {
      // Unaccept old answer if different
      if (post.acceptedAnswerId && post.acceptedAnswerId !== answerId) {
        const oldAnswer = await manager.findOne(Answer, {
          where: { id: post.acceptedAnswerId },
        });
        if (oldAnswer) {
          await manager.update(Answer, oldAnswer.id, { isAccepted: false });
          await manager
            .createQueryBuilder()
            .update(User)
            .set({
              reputation: () =>
                `GREATEST(0, reputation - ${ANSWER_ACCEPTED_REP})`,
            })
            .where("id = :id", { id: oldAnswer.authorId })
            .execute();
          await manager.decrement(
            User,
            { id: oldAnswer.authorId },
            "acceptedAnswersCount",
            1,
          );
          await manager.save(ReputationHistory, {
            userId: oldAnswer.authorId,
            event: "answer_unaccepted",
            change: -ANSWER_ACCEPTED_REP,
            relatedPostId: postId,
            relatedAnswerId: oldAnswer.id,
          });
        }
      }

      // Accept new answer
      await manager.update(Answer, answerId, { isAccepted: true });
      await manager.update(Post, postId, {
        acceptedAnswerId: answerId,
        status: PostStatus.ANSWERED,
      });
      await manager.increment(
        User,
        { id: answer.authorId },
        "reputation",
        ANSWER_ACCEPTED_REP,
      );
      await manager.increment(
        User,
        { id: answer.authorId },
        "acceptedAnswersCount",
        1,
      );
      await manager.save(ReputationHistory, {
        userId: answer.authorId,
        event: "answer_accepted",
        change: ANSWER_ACCEPTED_REP,
        relatedPostId: postId,
        relatedAnswerId: answerId,
      });
    });

    this.logger.log(`Answer ${answerId} accepted on post ${postId}`);
    return this.postService.getPost(postId);
  }

  async unacceptAnswer(
    userId: string,
    postId: string,
  ): Promise<PostDetailResponseDto> {
    const post = await this.postRepository.findOne({
      where: { id: postId, isDeleted: false },
    });
    if (!post) {
      throw new AppException(ErrorCode.POST_NOT_FOUND);
    }
    if (post.authorId !== userId) {
      throw new AppException(ErrorCode.FORBIDDEN);
    }
    if (!post.acceptedAnswerId) {
      throw new AppException(ErrorCode.NO_ACCEPTED_ANSWER);
    }

    const answer = await this.answerRepository.findOne({
      where: { id: post.acceptedAnswerId },
    });

    await this.dataSource.transaction(async (manager) => {
      if (answer) {
        await manager.update(Answer, answer.id, { isAccepted: false });
        await manager
          .createQueryBuilder()
          .update(User)
          .set({
            reputation: () =>
              `GREATEST(0, reputation - ${ANSWER_ACCEPTED_REP})`,
          })
          .where("id = :id", { id: answer.authorId })
          .execute();
        await manager.decrement(
          User,
          { id: answer.authorId },
          "acceptedAnswersCount",
          1,
        );
        await manager.save(ReputationHistory, {
          userId: answer.authorId,
          event: "answer_unaccepted",
          change: -ANSWER_ACCEPTED_REP,
          relatedPostId: postId,
          relatedAnswerId: answer.id,
        });
      }

      await manager.update(Post, postId, {
        acceptedAnswerId: null,
        status: PostStatus.OPEN,
      });
    });

    this.logger.log(`Answer unaccepted on post ${postId}`);
    return this.postService.getPost(postId);
  }

  private toAnswerResponse(answer: Answer): AnswerResponseDto {
    return {
      id: answer.id,
      content: answer.content,
      author: {
        id: answer.author.id,
        username: answer.author.username,
        displayName: answer.author.displayName,
        avatarUrl: answer.author.avatarUrl,
      },
      isAccepted: answer.isAccepted,
      score: answer.score,
      createdAt: answer.createdAt,
      updatedAt: answer.updatedAt,
    };
  }
}
