import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Channel } from "./channel.entity";
import { User } from "../../user/entities/user.entity";
import { ChatMessageAttachment } from "./chat-message-attachment.entity";

@Entity("chat_messages")
@Index("idx_chat_messages_channel_created", ["channelId", "createdAt"])
export class ChatMessage {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Channel, { eager: false })
  @JoinColumn()
  channel: Channel;

  @Column({ type: "uuid" })
  channelId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn()
  user: User;

  @Column({ type: "uuid" })
  userId: string;

  @Column({ type: "text" })
  content: string;

  @OneToMany(() => ChatMessageAttachment, (a) => a.message)
  attachments: ChatMessageAttachment[];

  @Column({ type: "timestamptz", nullable: true })
  editedAt: Date | null;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ type: "timestamptz", nullable: true })
  deletedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
