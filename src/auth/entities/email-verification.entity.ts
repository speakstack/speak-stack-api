import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("email_verifications")
export class EmailVerification {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column()
  email: string;

  @Column()
  otpHash: string;

  @Column({ default: 0 })
  attempts: number;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true, type: "timestamp" })
  verifiedAt: Date | null;

  @Column({ nullable: true, type: "timestamp" })
  usedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: "timestamp" })
  expiresAt: Date;
}
