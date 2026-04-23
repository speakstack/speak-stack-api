import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ChatMessage } from "./chat-message.entity";
import { User } from "../../user/entities/user.entity";

@Entity("chat_message_attachments")
export class ChatMessageAttachment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => ChatMessage, (m) => m.attachments, {
    eager: false,
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn()
  message: ChatMessage | null;

  @Column({ type: "uuid", nullable: true })
  messageId: string | null;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn()
  uploadedBy: User;

  @Column({ type: "uuid" })
  uploadedById: string;

  @Column()
  fileUrl: string;

  @Column()
  fileName: string;

  @Column()
  mimeType: string;

  @Column({ type: "integer" })
  fileSize: number;

  @CreateDateColumn()
  createdAt: Date;
}
