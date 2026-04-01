import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UserBadge } from "./user-badge.entity";

export enum BadgeTriggerType {
  FIRST_POST = "FIRST_POST",
  FIRST_ANSWER = "FIRST_ANSWER",
  FIRST_COMMENT = "FIRST_COMMENT",
  POST_COUNT = "POST_COUNT",
  ANSWER_COUNT = "ANSWER_COUNT",
  ACCEPTED_ANSWER_COUNT = "ACCEPTED_ANSWER_COUNT",
  UPVOTES_RECEIVED = "UPVOTES_RECEIVED",
}

@Entity("badges")
export class Badge {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, unique: true })
  slug: string;

  @Column({ type: "text" })
  description: string;

  @Column({ nullable: true, type: "varchar" })
  iconUrl: string | null;

  @Column({ type: "enum", enum: BadgeTriggerType })
  triggerType: BadgeTriggerType;

  @Column()
  threshold: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => UserBadge, (ub) => ub.badge)
  userBadges: UserBadge[];
}
