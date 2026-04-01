import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Level } from "./entities/level.entity";
import { AppException } from "../common/exceptions/app.exception";
import { ErrorCode } from "../common/enums/error-code.enum";

@Injectable()
export class LevelService {
  private cachedLevels: Level[] | null = null;

  constructor(
    @InjectRepository(Level)
    private readonly levelRepository: Repository<Level>,
  ) {}

  async getLevels(): Promise<Level[]> {
    if (!this.cachedLevels) {
      this.cachedLevels = await this.levelRepository.find({
        order: { minReputation: "ASC" },
      });
    }
    return this.cachedLevels;
  }

  async getLevelForReputation(
    reputation: number,
  ): Promise<{ current: Level; next: Level | null }> {
    const levels = await this.getLevels();
    if (levels.length === 0) {
      throw new AppException(ErrorCode.INTERNAL_ERROR);
    }
    let currentIndex = 0;
    for (let i = 0; i < levels.length; i++) {
      if (reputation >= levels[i].minReputation) {
        currentIndex = i;
      } else {
        break;
      }
    }
    return {
      current: levels[currentIndex],
      next: currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null,
    };
  }
}
