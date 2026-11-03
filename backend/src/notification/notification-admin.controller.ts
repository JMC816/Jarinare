// @role: widgets/controller
// @rule: 알림 파티션 수동 삭제 — 관리자 전용
import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { IsNumber } from "class-validator";
import { Type } from "class-transformer";
import type { Request } from "express";
import { AuditService } from "../audit/audit.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { Permissions } from "../auth/decorators/permissions.decorator";
import { NotificationService } from "./notification.service";

class DropPartitionQuery {
  @Type(() => Number)
  @IsNumber()
  year!: number;

  @Type(() => Number)
  @IsNumber()
  month!: number;
}

@ApiTags("admin-notification")
@ApiBearerAuth()
@Controller("admin/notification")
export class NotificationAdminController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly audit: AuditService,
  ) {}

  @Permissions("admin:manage")
  @Delete("partition")
  @ApiOperation({
    summary: "알림 파티션 수동 삭제 (관리자)",
    description: "지정한 연도·월의 알림 파티션을 즉시 삭제한다.",
  })
  @ApiQuery({ name: "year", description: "삭제할 연도 (예: 2026)" })
  @ApiQuery({ name: "month", description: "삭제할 월 (예: 6)" })
  async dropPartition(
    @Query() query: DropPartitionQuery,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    const result = await this.notificationService.dropPartition(query.year, query.month);
    this.audit.log({
      actorIdx: user.idx,
      action: "notification.partition_drop",
      targetType: "notification_partition",
      targetId: `${query.year}-${String(query.month).padStart(2, "0")}`,
      after: { year: query.year, month: query.month },
      ip: req.ip,
    });
    return result;
  }

  @Permissions("admin:manage")
  @Post("partition/drop-old")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "오래된 알림 파티션 자동 삭제 수동 실행 (관리자)",
    description: "크론과 동일한 로직으로 2달 전 파티션을 즉시 삭제한다.",
  })
  async dropOldPartition(
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    await this.notificationService.dropOldPartition();
    this.audit.log({
      actorIdx: user.idx,
      action: "notification.partition_drop",
      targetType: "notification_partition",
      targetId: "drop-old",
      ip: req.ip,
    });
    return { message: "오래된 파티션 삭제가 실행되었습니다." };
  }
}
