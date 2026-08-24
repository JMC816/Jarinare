// @role: app/module
import { Module } from "@nestjs/common";
import { NotificationController } from "./notification.controller";
import { NotificationService } from "./notification.service";
import { SseService } from "./sse.service";

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, SseService],
  exports: [NotificationService],
})
export class NotificationModule {}
