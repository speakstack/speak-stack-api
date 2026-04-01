import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, type: "varchar", unique: true })
  googleId: string | null;

  @Column({ nullable: true, type: "varchar" })
  passwordHash: string | null;

  @Column({ nullable: true, type: "varchar" })
  displayName: string | null;

  @Column({ nullable: true, type: "varchar" })
  avatarUrl: string | null;

  @Column({ default: "user" })
  role: string;

  @Column({ default: true })
  hasUsernameSet: boolean;

  @Column({ nullable: true, type: "varchar" })
  refreshTokenHash: string | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  reputation: number;

  @Column({ default: 0 })
  postsCount: number;

  @Column({ default: 0 })
  answersCount: number;

  @Column({ default: 0 })
  acceptedAnswersCount: number;

  @Column({ default: 0 })
  upvotesReceived: number;

  @Column({ default: 0 })
  commentsCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
