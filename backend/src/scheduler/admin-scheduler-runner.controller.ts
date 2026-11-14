import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Param,
  Post,
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
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { Permissions } from "../auth/decorators/permissions.decorator";
import { RunJobDto, RunJobResultDto } from "./dto/run-job.dto";
import { AdminSchedulerRunnerService } from "./admin-scheduler-runner.service";

@ApiTags("admin-scheduler")
@ApiBearerAuth()
@Controller("admin/scheduler")
export class AdminSchedulerRunnerController {
  constructor(
    private readonly runner: AdminSchedulerRunnerService,
    private readonly audit: AuditService,
  ) {}

  @Permissions("scheduler:run")
  @Post("jobs/:name/run")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "잡 수동 실행",
    description:
      "지정한 잡을 즉시 큐에 적재한다. train-time-sync 는 startDate/endDate/days 를 body 에 전달할 수 있다.",
  })
  @ApiOkResponse({ type: RunJobResultDto })
  async runJob(
    @Param("name") name: string,
    @Body() dto: RunJobDto,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ): Promise<RunJobResultDto> {
    if (name === "notification-drop") {
      if (user.adminRoleCode !== "SUPER_ADMIN") {
        throw new ForbiddenException(
          "notification-drop 은 SUPER_ADMIN 만 실행할 수 있습니다.",
        );
      }
      if (!dto.confirm) {
        throw new BadRequestException(
          "notification-drop 은 되돌릴 수 없습니다. body 에 confirm: true 를 포함하세요.",
        );
      }
    }

    const result = await this.runner.runJob(name, dto, BigInt(user.idx));

    this.audit.log({
      actorIdx: user.idx,
      action: "scheduler.run",
      targetType: "scheduler",
      targetId: name,
      after: { runId: result.runId, ...dto },
      ip: req.ip,
    });

    return result;
  }

  @Permissions("scheduler:run")
  @Post("runs/:runId/retry")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "실패·취소된 작업 재실행",
    description:
      "FAILED 또는 CANCELLED 상태의 작업을 동일 파라미터로 큐에 재적재한다. 새 runId 를 반환한다.",
  })
  @ApiOkResponse({ type: RunJobResultDto })
  async retryRun(
    @Param("runId") runId: string,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ): Promise<RunJobResultDto> {
    if (!/^\d+$/.test(runId)) {
      throw new BadRequestException("runId 는 숫자여야 합니다.");
    }
    const result = await this.runner.retryRun(BigInt(runId), BigInt(user.idx));

    this.audit.log({
      actorIdx: user.idx,
      action: "scheduler.retry",
      targetType: "scheduler",
      targetId: result.jobName,
      after: { originalRunId: runId, newRunId: result.runId },
      ip: req.ip,
    });

    return result;
  }
}
