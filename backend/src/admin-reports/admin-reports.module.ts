import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AuditModule } from "../audit/audit.module";
import { AdminReportsController } from "./admin-reports.controller";
import { ReportsController } from "./reports.controller";
import { AdminReportsService } from "./admin-reports.service";

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [AdminReportsController, ReportsController],
  providers: [AdminReportsService],
})
export class AdminReportsModule {}
