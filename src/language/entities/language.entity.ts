import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("languages")
export class Language {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true, length: 10 })
  code: string;

  @Column({ length: 50 })
  name: string;

  @CreateDateColumn()
  createdAt: Date;
}
