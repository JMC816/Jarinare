import { Controller, HttpCode, HttpStatus, Post, Req } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type { Request } from "express";
import { AuditService } from "../audit/audit.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { Permissions } from "../auth/decorators/permissions.decorator";
import { StationSyncResultDto } from "./dto/station-response.dto";
import { StationsSyncService } from "./stations-sync.service";

/**
 * 관리자 전용 역 수동 동기화 API.
 */
@ApiTags("admin-stations")
@ApiBearerAuth()
@Controller("admin/stations")
export class AdminStationsController {
  constructor(
    private readonly stationsSyncService: StationsSyncService,
    private readonly audit: AuditService,
  ) {}

  @Permissions("scheduler:run")
  @Post("sync")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "역 목록 수동 동기화 (관리자)",
    description: "외부 API 에서 전체 역 목록을 다시 수집하여 DB 를 최신화한다.",
  })
  @ApiOkResponse({ type: StationSyncResultDto })
  async sync(
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ): Promise<StationSyncResultDto> {
    const result = await this.stationsSyncService.syncAll();
    this.audit.log({
      actorIdx: user.idx,
      action: "scheduler.station_sync",
      targetType: "scheduler",
      targetId: "station-sync",
      after: result,
      ip: req.ip,
    });
    return result;
  }
}
