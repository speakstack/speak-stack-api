import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { LevelService } from "./level.service";
import { Level } from "./entities/level.entity";
import { Public } from "../common/decorators/public.decorator";

@ApiTags("Levels")
@Controller("levels")
export class LevelController {
  constructor(private readonly levelService: LevelService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get all levels" })
  @ApiResponse({ status: HttpStatus.OK, type: [Level] })
  getLevels(): Promise<Level[]> {
    return this.levelService.getLevels();
  }
}
