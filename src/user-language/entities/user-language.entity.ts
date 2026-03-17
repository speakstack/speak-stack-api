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
import { Language } from "../../language/entities/language.entity";

export enum UserLanguageRelation {
  NATIVE = "native",
  LEARNING = "learning",
  CAN_HELP = "can_help",
}

export enum LanguageProficiency {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
  FLUENT = "fluent",
  NATIVE = "native",
}

@Entity("user_languages")
export class UserLanguage {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Language, { eager: false })
  @JoinColumn()
  language: Language;

  @Column()
  languageId: string;

  @Column({ type: "enum", enum: UserLanguageRelation })
  relation: UserLanguageRelation;

  @Column({ type: "enum", enum: LanguageProficiency, nullable: true })
  proficiency: LanguageProficiency | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
