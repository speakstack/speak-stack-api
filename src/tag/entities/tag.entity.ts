import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

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

  @CreateDateColumn()
  createdAt: Date;
}
