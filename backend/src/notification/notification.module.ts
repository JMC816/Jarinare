// @role: app/module
import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module";
import { NotificationController } from "./notification.controller";
import { NotificationAdminController } from "./notification-admin.controller";
import { NotificationService } from "./notification.service";
import { NotificationDispatcher } from "./notification-dispatcher.service";
import { SseService } from "./sse.service";

@Module({
  imports: [AuditModule],
  controllers: [NotificationController, NotificationAdminController],
  providers: [NotificationService, NotificationDispatcher, SseService],
  exports: [NotificationService],
})
export class NotificationModule {}
