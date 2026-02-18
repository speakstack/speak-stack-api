import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  displayName: string;

  @Column({ nullable: true, type: "varchar" })
  avatarUrl: string | null;

  @Column({ default: "user" })
  role: string;

  @Column({ nullable: true, type: "varchar" })
  refreshTokenHash: string | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 1 })
  reputation: number;

  @Column({ default: 0 })
  postsCount: number;

  @Column({ default: 0 })
  answersCount: number;

  @Column({ default: 0 })
  acceptedAnswersCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
