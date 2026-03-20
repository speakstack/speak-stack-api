import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("reputation_history")
export class ReputationHistory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  userId: string;

  @Column({ length: 50 })
  event: string;

  @Column()
  change: number;

  @Column({ nullable: true, type: "uuid" })
  relatedPostId: string | null;

  @Column({ nullable: true, type: "uuid" })
  relatedAnswerId: string | null;

  @Column({ nullable: true, type: "uuid" })
  relatedCommentId: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
