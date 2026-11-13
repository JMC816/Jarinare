import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AuditModule } from "../audit/audit.module";
import { NotificationModule } from "../notification/notification.module";
import { AdminNotificationController } from "./admin-notification.controller";
import { AdminNotificationService } from "./admin-notification.service";

@Module({
  imports: [PrismaModule, AuditModule, NotificationModule],
  controllers: [AdminNotificationController],
  providers: [AdminNotificationService],
})
export class AdminNotificationModule {}
