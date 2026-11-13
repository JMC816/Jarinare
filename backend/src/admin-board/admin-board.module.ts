import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AuditModule } from "../audit/audit.module";
import { AdminBoardController } from "./admin-board.controller";
import { AdminBoardService } from "./admin-board.service";

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [AdminBoardController],
  providers: [AdminBoardService],
})
export class AdminBoardModule {}
