import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from "typeorm";
import { Badge, BadgeTriggerType } from "./entities/badge.entity";
import { UserBadge } from "./entities/user-badge.entity";
import { User } from "../user/entities/user.entity";

@Injectable()
export class BadgeService {
  private cachedBadges: Badge[] | null = null;

  constructor(
    @InjectRepository(Badge)
    private readonly badgeRepository: Repository<Badge>,
    @InjectRepository(UserBadge)
    private readonly userBadgeRepository: Repository<UserBadge>,
  ) {}

  async getBadges(): Promise<Badge[]> {
    if (!this.cachedBadges) {
      this.cachedBadges = await this.badgeRepository.find({
        order: { createdAt: "ASC" },
      });
    }
    return this.cachedBadges;
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    return this.userBadgeRepository.find({
      where: { userId },
      relations: ["badge"],
      order: { awardedAt: "ASC" },
    });
  }

  async checkAndAwardBadges(
    userId: string,
    triggerTypes: BadgeTriggerType[],
    manager: EntityManager,
  ): Promise<void> {
    const allBadges = await this.getBadges();
    const relevant = allBadges.filter((b) =>
      triggerTypes.includes(b.triggerType),
    );
    if (relevant.length === 0) return;

    const user = await manager.findOne(User, { where: { id: userId } });
    if (!user) return;

    for (const badge of relevant) {
      const counter = this.getCounterForTrigger(user, badge.triggerType);
      if (counter >= badge.threshold) {
        const existing = await manager.findOne(UserBadge, {
          where: { userId, badgeId: badge.id },
        });
        if (!existing) {
          await manager.save(UserBadge, { userId, badgeId: badge.id });
        }
      }
    }
  }

  private getCounterForTrigger(
    user: User,
    triggerType: BadgeTriggerType,
  ): number {
    switch (triggerType) {
      case BadgeTriggerType.FIRST_POST:
      case BadgeTriggerType.POST_COUNT:
        return user.postsCount;
      case BadgeTriggerType.FIRST_ANSWER:
      case BadgeTriggerType.ANSWER_COUNT:
        return user.answersCount;
      case BadgeTriggerType.FIRST_COMMENT:
        return user.commentsCount;
      case BadgeTriggerType.ACCEPTED_ANSWER_COUNT:
        return user.acceptedAnswersCount;
      case BadgeTriggerType.UPVOTES_RECEIVED:
        return user.upvotesReceived;
      default:
        return 0;
    }
  }
}
