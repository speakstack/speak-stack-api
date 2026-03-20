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
import { Answer } from "../../answer/entities/answer.entity";

@Entity("answer_votes")
@Unique(["userId", "answerId"])
export class AnswerVote {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn()
  user: User;

  @Column({ type: "uuid" })
  userId: string;

  @ManyToOne(() => Answer, { eager: false })
  @JoinColumn()
  answer: Answer;

  @Column({ type: "uuid" })
  answerId: string;

  @Column({ type: "smallint" })
  value: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
