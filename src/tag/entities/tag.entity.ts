import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Language } from "../../language/entities/language.entity";

@Entity("tags")
export class Tag {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 30 })
  name: string;

  @Column({ length: 30, unique: true })
  slug: string;

  @Column({ nullable: true, type: "text" })
  description: string | null;

  @Column({ type: "char", length: 7, default: "#6B7280" })
  color: string;

  @Column({ default: 0 })
  postsCount: number;

  @Column({ default: 0 })
  followersCount: number;

  @ManyToOne(() => Language, { nullable: true, eager: false })
  @JoinColumn()
  language: Language | null;

  @Column({ nullable: true, type: "uuid" })
  languageId: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
