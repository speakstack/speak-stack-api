import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../user/entities/user.entity";
import { Post } from "../../post/entities/post.entity";

@Entity("post_votes")
@Unique(["userId", "postId"])
export class PostVote {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn()
  user: User;

  @Column({ type: "uuid" })
  userId: string;

  @ManyToOne(() => Post, { eager: false })
  @JoinColumn()
  post: Post;

  @Column({ type: "uuid" })
  postId: string;

  @Column({ type: "smallint" })
  value: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
