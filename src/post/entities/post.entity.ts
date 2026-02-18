import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../user/entities/user.entity";
import { Tag } from "../../tag/entities/tag.entity";

export enum PostType {
  QUESTION = "question",
  DISCUSSION = "discussion",
  RESOURCE = "resource",
  PRACTICE = "practice",
}

export enum PostStatus {
  OPEN = "open",
  ANSWERED = "answered",
  CLOSED = "closed",
}

@Entity("posts")
export class Post {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn()
  author: User;

  @Column()
  authorId: string;

  @Column({ type: "enum", enum: PostType })
  type: PostType;

  @Column({ type: "enum", enum: PostStatus, default: PostStatus.OPEN })
  status: PostStatus;

  @Column({ length: 200 })
  title: string;

  @Column({ type: "text" })
  content: string;

  @Column({ nullable: true, type: "uuid" })
  acceptedAnswerId: string | null;

  @Column({ default: 0 })
  upvoteCount: number;

  @Column({ default: 0 })
  downvoteCount: number;

  @Column({ default: 0 })
  score: number;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  answerCount: number;

  @Column({ default: 0 })
  commentCount: number;

  @Column({ default: 0 })
  bookmarkCount: number;

  @Column({ type: "double precision", default: 0 })
  hotScore: number;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ nullable: true, type: "timestamptz" })
  deletedAt: Date | null;

  @Column({ default: false })
  isClosed: boolean;

  @Column({ nullable: true, type: "text" })
  closedReason: string | null;

  @Column({ nullable: true, type: "uuid" })
  closedById: string | null;

  @ManyToMany(() => Tag, { eager: false })
  @JoinTable({
    name: "post_tags",
    joinColumn: { name: "post_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "tag_id", referencedColumnName: "id" },
  })
  tags: Tag[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: "timestamptz", default: () => "NOW()" })
  lastActivityAt: Date;
}
