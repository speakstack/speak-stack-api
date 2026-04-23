import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Language } from "../../language/entities/language.entity";
import { User } from "../../user/entities/user.entity";

@Entity("channels")
export class Channel {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 64 })
  slug: string;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @ManyToOne(() => Language, { eager: false, nullable: true })
  @JoinColumn()
  language: Language | null;

  @Column({ type: "uuid", nullable: true })
  languageId: string | null;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn()
  createdBy: User;

  @Column({ type: "uuid" })
  createdById: string;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ type: "timestamptz", nullable: true })
  deletedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
