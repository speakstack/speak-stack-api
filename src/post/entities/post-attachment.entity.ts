import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Post } from "./post.entity";

export enum AttachmentType {
  IMAGE = "image",
  DOCUMENT = "document",
  AUDIO = "audio",
}

@Entity("post_attachments")
export class PostAttachment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Post, (post) => post.attachments, { eager: false })
  @JoinColumn()
  post: Post;

  @Column()
  postId: string;

  @Column()
  originalName: string;

  @Column()
  storagePath: string;

  @Column()
  mimeType: string;

  @Column({ type: "integer" })
  size: number;

  @Column({ type: "enum", enum: AttachmentType })
  type: AttachmentType;

  @CreateDateColumn()
  createdAt: Date;
}
