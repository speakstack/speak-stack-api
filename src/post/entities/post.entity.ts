import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../user/entities/user.entity";
import { Tag } from "../../tag/entities/tag.entity";
import { Language } from "../../language/entities/language.entity";
import { PostAttachment } from "./post-attachment.entity";

export enum PostType {
  QUESTION = "question",
  DISCUSSION = "discussion",
  RESOURCE = "resource",
  // PRACTICE = "practice",
  HOW_DO_YOU_SAY = "how_do_you_say",
  DOES_THIS_SOUND_NATURAL = "does_this_sound_natural",
  PLEASE_CORRECT = "please_correct",
  WHATS_THE_DIFFERENCE = "whats_the_difference",
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

  @ManyToOne(() => Language, { eager: false })
  @JoinColumn()
  targetLanguage: Language;

  @Column()
  targetLanguageId: string;

  @ManyToMany(() => Tag, { eager: false })
  @JoinTable({
    name: "post_tags",
    joinColumn: { name: "post_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "tag_id", referencedColumnName: "id" },
  })
  tags: Tag[];

  @OneToMany(() => PostAttachment, (attachment) => attachment.post)
  attachments: PostAttachment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: "timestamptz", default: () => "NOW()" })
  lastActivityAt: Date;
}
