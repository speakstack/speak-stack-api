import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { Badge } from "./badge.entity";

@Entity("user_badges")
@Unique(["userId", "badgeId"])
export class UserBadge {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  userId: string;

  @Column({ type: "uuid" })
  badgeId: string;

  @CreateDateColumn()
  awardedAt: Date;

  @ManyToOne(() => Badge, (badge) => badge.userBadges, { eager: false })
  @JoinColumn()
  badge: Badge;
}
