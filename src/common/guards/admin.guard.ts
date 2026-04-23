import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Request } from "express";
import { User } from "../../user/entities/user.entity";
import { JwtPayload } from "../../auth/types/tokens.type";
import { AppException } from "../exceptions/app.exception";
import { ErrorCode } from "../enums/error-code.enum";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();
    const jwt = req.user as JwtPayload | undefined;
    if (!jwt?.sub) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }
    const user = await this.userRepository.findOne({
      where: { id: jwt.sub },
      select: { id: true, role: true, isActive: true },
    });
    if (!user || !user.isActive) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }
    if (user.role !== "admin") {
      throw new AppException(ErrorCode.FORBIDDEN);
    }
    return true;
  }
}
