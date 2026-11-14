import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { Permissions } from "../auth/decorators/permissions.decorator";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { AdminNotificationService } from "./admin-notification.service";
import { SendNotificationDto } from "./dto/admin-notification.dto";

@ApiBearerAuth()
@ApiTags("Admin - 알림 발송")
@Controller("admin/notifications")
export class AdminNotificationController {
  constructor(private readonly adminNotification: AdminNotificationService) {}

  @Post("broadcast")
  @ApiOperation({ summary: "알림 발송 (targetUserIdxList 비우면 전체 발송)" })
  @Permissions("notification:send")
  send(@Body() dto: SendNotificationDto, @Req() req: Request & { user: AuthUser }) {
    return this.adminNotification.send(dto, req.user, req.ip);
  }
}
