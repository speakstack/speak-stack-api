import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../user/entities/user.entity";
import { Post } from "../../post/entities/post.entity";

@Entity("answers")
export class Answer {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Post, { eager: false })
  @JoinColumn()
  post: Post;

  @Column()
  postId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn()
  author: User;

  @Column()
  authorId: string;

  @Column({ type: "text" })
  content: string;

  @Column({ default: 0 })
  upvoteCount: number;

  @Column({ default: 0 })
  downvoteCount: number;

  @Column({ default: 0 })
  score: number;

  @Column({ default: false })
  isAccepted: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true, type: "uuid" })
  verifiedById: string | null;

  @Column({ nullable: true, type: "timestamptz" })
  verifiedAt: Date | null;

  @Column({ default: false })
  isAiChecked: boolean;

  @Column({ default: 0 })
  commentCount: number;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ nullable: true, type: "timestamptz" })
  deletedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
