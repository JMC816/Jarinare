import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AuditModule } from "../audit/audit.module";
import { AdminReservationController } from "./admin-reservation.controller";
import { AdminReservationService } from "./admin-reservation.service";

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [AdminReservationController],
  providers: [AdminReservationService],
})
export class AdminReservationModule {}
