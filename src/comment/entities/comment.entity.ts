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
import { Answer } from "../../answer/entities/answer.entity";

@Entity("comments")
export class Comment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Answer, { eager: false })
  @JoinColumn()
  answer: Answer;

  @Column()
  answerId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @Column({ type: "text" })
  content: string;

  @Column({ nullable: true, type: "timestamptz" })
  editedAt: Date | null;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ nullable: true, type: "timestamptz" })
  deletedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
