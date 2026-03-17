import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Tag } from "./entities/tag.entity";

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async findAll(language?: string): Promise<Tag[]> {
    const qb = this.tagRepository
      .createQueryBuilder("tag")
      .leftJoinAndSelect("tag.language", "language");
    if (language) {
      qb.andWhere("language.code = :language", { language });
    }
    qb.orderBy("tag.name", "ASC");
    return qb.getMany();
  }
}
