import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type { Request } from "express";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../prisma/prisma.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { Permissions } from "../auth/decorators/permissions.decorator";
import {
  CancelResultDto,
  SchedulerRunLogItemDto,
  SchedulerRunQueryDto,
  UpdateJobSettingDto,
} from "./dto/scheduler-run.dto";
import { JobQueueService } from "./job-queue.service";
import {
  SchedulerRunLogItem,
  SchedulerRunLogService,
} from "./scheduler-run-log.service";

/**
 * 관리자 전용 스케줄러 큐 관측/제어 API.
 * (도메인별 수동 실행은 admin/stations · admin/trains 컨트롤러에서 큐로 적재한다.)
 */
@ApiTags("admin-scheduler")
@ApiBearerAuth()
@Controller("admin/scheduler")
export class AdminSchedulerController {
  constructor(
    private readonly runLog: SchedulerRunLogService,
    private readonly queue: JobQueueService,
    private readonly audit: AuditService,
    private readonly prisma: PrismaService,
  ) {}

  @Permissions("scheduler:run")
  @Get("runs")
  @ApiOperation({ summary: "스케줄러 실행 로그 목록 (관리자)" })
  @ApiOkResponse({ type: [SchedulerRunLogItemDto] })
  list(@Query() query: SchedulerRunQueryDto): Promise<SchedulerRunLogItem[]> {
    return this.runLog.list({
      limit: query.limit ?? 50,
      jobName: query.jobName,
      status: query.status,
      triggeredBy:
        query.triggeredBy !== undefined ? BigInt(query.triggeredBy) : undefined,
    });
  }

  @Permissions("scheduler:run")
  @Get("runs/:runId")
  @ApiOperation({ summary: "스케줄러 실행 로그 상세 (관리자)" })
  @ApiOkResponse({ type: SchedulerRunLogItemDto })
  async getOne(@Param("runId") runId: string): Promise<SchedulerRunLogItem> {
    if (!/^\d+$/.test(runId))
      throw new BadRequestException("runId 는 숫자여야 합니다.");
    return this.runLog.get(BigInt(runId));
  }

  @Permissions("scheduler:run")
  @Get("runs/summary")
  @ApiOperation({ summary: "스케줄러 상태별 건수 요약 (관리자)" })
  summary(): Promise<Record<string, number>> {
    return this.runLog.summary();
  }

  @Permissions("scheduler:run")
  @Post("runs/:runId/cancel")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "대기 중(PENDING) 작업 취소 (관리자)",
    description:
      "아직 실행되지 않은 작업만 취소된다. 이미 실행/종료된 작업은 false.",
  })
  @ApiOkResponse({ type: CancelResultDto })
  async cancel(
    @Param("runId") runId: string,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ): Promise<CancelResultDto> {
    if (!/^\d+$/.test(runId)) {
      throw new BadRequestException("runId 는 숫자여야 합니다.");
    }
    const cancelled = await this.queue.cancelPending(BigInt(runId));
    this.audit.log({
      actorIdx: user.idx,
      action: "scheduler.cancel",
      targetType: "scheduler",
      targetId: runId,
      after: { cancelled },
      ip: req.ip,
    });
    return { runId, cancelled };
  }

  @Permissions("scheduler:read")
  @Get("settings")
  @ApiOperation({ summary: "잡 설정 목록" })
  async listSettings() {
    const settings = await this.prisma.schedulerJobSetting.findMany({ orderBy: { name: "asc" } });
    return settings.map((s) => ({ ...s, updatedBy: s.updatedBy?.toString() ?? null }));
  }

  @Permissions("scheduler:run")
  @Patch("settings/:name")
  @ApiOperation({ summary: "잡 활성화·비활성화" })
  async updateSetting(
    @Param("name") name: string,
    @Body() dto: UpdateJobSettingDto,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    const setting = await this.prisma.schedulerJobSetting.upsert({
      where: { name },
      update: { isActive: dto.isActive, updatedBy: BigInt(user.idx) },
      create: { name, isActive: dto.isActive, updatedBy: BigInt(user.idx) },
    });

    this.audit.log({
      actorIdx: user.idx,
      action: "scheduler.setting_update",
      targetType: "scheduler",
      targetId: name,
      after: { isActive: dto.isActive },
      ip: req.ip,
    });

    return { ...setting, updatedBy: setting.updatedBy?.toString() ?? null };
  }
}
