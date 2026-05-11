import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { DataSource, In } from "typeorm";
import { PostVote } from "./entities/post-vote.entity";
import { AnswerVote } from "./entities/answer-vote.entity";
import { Post } from "../post/entities/post.entity";
import { Answer } from "../answer/entities/answer.entity";
import { User } from "../user/entities/user.entity";
import { ReputationHistory } from "../reputation/entities/reputation-history.entity";
import { VoteResponseDto } from "./dto/vote.dto";
import { AppException } from "../common/exceptions/app.exception";
import { ErrorCode } from "../common/enums/error-code.enum";
import { BadgeService } from "../badge/badge.service";
import { BadgeTriggerType } from "../badge/entities/badge.entity";
import {
  NOTIFICATION_EVENTS,
  NotificationEvent,
} from "../notification/notification.types";

const POST_UPVOTE_REP = 3;
const ANSWER_UPVOTE_REP = 5;

@Injectable()
export class VoteService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly badgeService: BadgeService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async votePost(
    userId: string,
    postId: string,
    value: number,
  ): Promise<VoteResponseDto> {
    let notifPayload: NotificationEvent | null = null;

    const result = await this.dataSource.transaction(async (manager) => {
      const post = await manager.findOne(Post, {
        where: { id: postId, isDeleted: false },
      });

      if (!post) {
        throw new AppException(ErrorCode.POST_NOT_FOUND);
      }

      if (post.authorId === userId) {
        throw new AppException(ErrorCode.SELF_VOTE_NOT_ALLOWED);
      }

      const existingVote = await manager.findOne(PostVote, {
        where: { userId, postId },
      });

      let finalValue = value;

      // Toggle logic: same value again = cancel
      if (existingVote && existingVote.value === value) {
        finalValue = 0;
      }

      // Calculate count changes
      if (existingVote) {
        // Remove old vote counts
        if (existingVote.value === 1) {
          await manager.decrement(Post, { id: postId }, "upvoteCount", 1);
          // Remove rep for old upvote
          await manager
            .createQueryBuilder()
            .update(User)
            .set({
              reputation: () => `GREATEST(0, reputation - ${POST_UPVOTE_REP})`,
            })
            .where("id = :id", { id: post.authorId })
            .execute();

          await manager.save(ReputationHistory, {
            userId: post.authorId,
            event: "post_upvote_removed",
            change: -POST_UPVOTE_REP,
            relatedPostId: postId,
          });
          await manager
            .createQueryBuilder()
            .update(User)
            .set({ upvotesReceived: () => "GREATEST(0, upvotes_received - 1)" })
            .where("id = :id", { id: post.authorId })
            .execute();
        } else if (existingVote.value === -1) {
          await manager.decrement(Post, { id: postId }, "downvoteCount", 1);
        }
      }

      if (finalValue === 0) {
        if (existingVote) {
          await manager.remove(PostVote, existingVote);
        }
      } else {
        if (finalValue === 1) {
          await manager.increment(Post, { id: postId }, "upvoteCount", 1);
          await manager.increment(
            User,
            { id: post.authorId },
            "reputation",
            POST_UPVOTE_REP,
          );

          await manager.save(ReputationHistory, {
            userId: post.authorId,
            event: "post_upvoted",
            change: POST_UPVOTE_REP,
            relatedPostId: postId,
          });
          await manager.increment(
            User,
            { id: post.authorId },
            "upvotesReceived",
            1,
          );
          await this.badgeService.checkAndAwardBadges(
            post.authorId,
            [BadgeTriggerType.UPVOTES_RECEIVED],
            manager,
          );

          // capture notification data inside transaction where post is available
          const actor = await manager.findOne(User, {
            where: { id: userId },
            select: ["id", "username"],
          });
          if (actor) {
            notifPayload = {
              type: "vote.received",
              recipientId: post.authorId,
              actorId: userId,
              actorUsername: actor.username,
              entityId: postId,
              entityType: "post",
              postId,
            };
          }
        } else if (finalValue === -1) {
          await manager.increment(Post, { id: postId }, "downvoteCount", 1);
        }

        if (existingVote) {
          existingVote.value = finalValue;
          await manager.save(PostVote, existingVote);
        } else {
          await manager.save(PostVote, { userId, postId, value: finalValue });
        }
      }

      // Recalculate score atomically
      await manager
        .createQueryBuilder()
        .update(Post)
        .set({ score: () => "upvote_count - downvote_count" })
        .where("id = :id", { id: postId })
        .execute();

      const updatedPost = await manager.findOne(Post, {
        where: { id: postId },
        select: ["upvoteCount", "downvoteCount", "score"],
      });

      return {
        upvoteCount: updatedPost!.upvoteCount,
        downvoteCount: updatedPost!.downvoteCount,
        score: updatedPost!.score,
        userVote: finalValue,
      };
    });

    if (notifPayload) {
      this.eventEmitter.emit(NOTIFICATION_EVENTS.VOTE_RECEIVED, notifPayload);
    }

    return result;
  }

  async voteAnswer(
    userId: string,
    answerId: string,
    value: number,
  ): Promise<VoteResponseDto> {
    let notifPayload: NotificationEvent | null = null;

    const result = await this.dataSource.transaction(async (manager) => {
      const answer = await manager.findOne(Answer, {
        where: { id: answerId, isDeleted: false },
      });

      if (!answer) {
        throw new AppException(ErrorCode.ANSWER_NOT_FOUND);
      }

      if (answer.authorId === userId) {
        throw new AppException(ErrorCode.SELF_VOTE_NOT_ALLOWED);
      }

      const existingVote = await manager.findOne(AnswerVote, {
        where: { userId, answerId },
      });

      let finalValue = value;

      // Toggle logic: same value again = cancel
      if (existingVote && existingVote.value === value) {
        finalValue = 0;
      }

      // Calculate count changes
      if (existingVote) {
        // Remove old vote counts
        if (existingVote.value === 1) {
          await manager.decrement(Answer, { id: answerId }, "upvoteCount", 1);
          // Remove rep for old upvote
          await manager
            .createQueryBuilder()
            .update(User)
            .set({
              reputation: () =>
                `GREATEST(0, reputation - ${ANSWER_UPVOTE_REP})`,
            })
            .where("id = :id", { id: answer.authorId })
            .execute();

          await manager.save(ReputationHistory, {
            userId: answer.authorId,
            event: "answer_upvote_removed",
            change: -ANSWER_UPVOTE_REP,
            relatedAnswerId: answerId,
          });
          await manager
            .createQueryBuilder()
            .update(User)
            .set({ upvotesReceived: () => "GREATEST(0, upvotes_received - 1)" })
            .where("id = :id", { id: answer.authorId })
            .execute();
        } else if (existingVote.value === -1) {
          await manager.decrement(Answer, { id: answerId }, "downvoteCount", 1);
        }
      }

      if (finalValue === 0) {
        if (existingVote) {
          await manager.remove(AnswerVote, existingVote);
        }
      } else {
        if (finalValue === 1) {
          await manager.increment(Answer, { id: answerId }, "upvoteCount", 1);
          await manager.increment(
            User,
            { id: answer.authorId },
            "reputation",
            ANSWER_UPVOTE_REP,
          );

          await manager.save(ReputationHistory, {
            userId: answer.authorId,
            event: "answer_upvoted",
            change: ANSWER_UPVOTE_REP,
            relatedAnswerId: answerId,
          });
          await manager.increment(
            User,
            { id: answer.authorId },
            "upvotesReceived",
            1,
          );
          await this.badgeService.checkAndAwardBadges(
            answer.authorId,
            [BadgeTriggerType.UPVOTES_RECEIVED],
            manager,
          );

          const actor = await manager.findOne(User, {
            where: { id: userId },
            select: ["id", "username"],
          });
          if (actor) {
            notifPayload = {
              type: "vote.received",
              recipientId: answer.authorId,
              actorId: userId,
              actorUsername: actor.username,
              entityId: answerId,
              entityType: "answer",
              postId: answer.postId,
            };
          }
        } else if (finalValue === -1) {
          await manager.increment(Answer, { id: answerId }, "downvoteCount", 1);
        }

        if (existingVote) {
          existingVote.value = finalValue;
          await manager.save(AnswerVote, existingVote);
        } else {
          await manager.save(AnswerVote, {
            userId,
            answerId,
            value: finalValue,
          });
        }
      }

      // Recalculate score atomically
      await manager
        .createQueryBuilder()
        .update(Answer)
        .set({ score: () => "upvote_count - downvote_count" })
        .where("id = :id", { id: answerId })
        .execute();

      const updatedAnswer = await manager.findOne(Answer, {
        where: { id: answerId },
        select: ["upvoteCount", "downvoteCount", "score"],
      });

      return {
        upvoteCount: updatedAnswer!.upvoteCount,
        downvoteCount: updatedAnswer!.downvoteCount,
        score: updatedAnswer!.score,
        userVote: finalValue,
      };
    });

    if (notifPayload) {
      this.eventEmitter.emit(NOTIFICATION_EVENTS.VOTE_RECEIVED, notifPayload);
    }

    return result;
  }

  /**
   * Get the current user's vote value for a post.
   * Returns 0 if no vote exists.
   */
  async getUserPostVote(userId: string, postId: string): Promise<number> {
    const vote = await this.dataSource.manager.findOne(PostVote, {
      where: { userId, postId },
      select: ["value"],
    });
    return vote?.value ?? 0;
  }

  /**
   * Get the current user's vote values for multiple posts.
   * Returns a map of postId -> vote value.
   */
  async getUserPostVotes(
    userId: string,
    postIds: string[],
  ): Promise<Record<string, number>> {
    if (postIds.length === 0) return {};

    const votes = await this.dataSource.manager.find(PostVote, {
      where: { userId, postId: In(postIds) },
      select: ["postId", "value"],
    });

    const map: Record<string, number> = {};
    for (const vote of votes) {
      map[vote.postId] = vote.value;
    }
    return map;
  }

  /**
   * Get the current user's vote values for multiple answers.
   * Returns a map of answerId -> vote value.
   */
  async getUserAnswerVotes(
    userId: string,
    answerIds: string[],
  ): Promise<Record<string, number>> {
    if (answerIds.length === 0) return {};

    const votes = await this.dataSource.manager.find(AnswerVote, {
      where: { userId, answerId: In(answerIds) },
      select: ["answerId", "value"],
    });

    const map: Record<string, number> = {};
    for (const vote of votes) {
      map[vote.answerId] = vote.value;
    }
    return map;
  }
}
