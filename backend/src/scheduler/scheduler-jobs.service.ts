import { Injectable } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";

export interface JobInfo {
  name: string;
  cron: string;
  description: string;
  nextRunAt: Date | null;
  lastStatus: string | null;
  lastDurationMs: number | null;
  lastRunAt: Date | null;
  isActive: boolean;
}

// 알려진 잡 메타데이터
const JOB_META: Record<string, { description: string; cronFallback: string }> = {
  "station-sync":        { description: "역 목록 동기화",         cronFallback: "0 0 * * *" },
  "train-time-sync":     { description: "열차시간 사전 캐싱",      cronFallback: "0 4 * * *" },
  "notification-rotate": { description: "알림 파티션 로테이션",    cronFallback: "10 0 1 * *" },
  "notification-drop":   { description: "알림 파티션 삭제",        cronFallback: "5 0 1 * *" },
  "seat-change-expire":  { description: "좌석 변경 요청 만료",     cronFallback: "* * * * *" },
  "seat-hold-expire":    { description: "좌석 선점 만료 해제",     cronFallback: "* * * * *" },
};

@Injectable()
export class SchedulerJobsService {
  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly prisma: PrismaService,
  ) {}

  async listJobs(): Promise<JobInfo[]> {
    // 마지막 실행 로그 (잡별 최신 1건)
    const lastLogs = await this.prisma.schedulerRunLog.findMany({
      where: { jobName: { in: Object.keys(JOB_META) } },
      orderBy: { runId: "desc" },
      distinct: ["jobName"],
    });
    const logMap = new Map(lastLogs.map((l) => [l.jobName, l]));

    // 활성 상태 설정
    const settings = await this.prisma.schedulerJobSetting.findMany();
    const settingMap = new Map(settings.map((s) => [s.name, s.isActive]));

    return Object.entries(JOB_META).map(([name, meta]) => {
      const nextRunAt = this.getNextRunAt(name);
      const log = logMap.get(name);
      const durationMs =
        log?.startedAt && log.endedAt
          ? log.endedAt.getTime() - log.startedAt.getTime()
          : null;

      return {
        name,
        cron: this.getCronExpression(name) ?? meta.cronFallback,
        description: meta.description,
        nextRunAt,
        lastStatus: log?.status ?? null,
        lastDurationMs: durationMs,
        lastRunAt: log?.startedAt ?? null,
        isActive: settingMap.get(name) ?? true,
      };
    });
  }

  private getNextRunAt(jobName: string): Date | null {
    try {
      const job = this.schedulerRegistry.getCronJob(jobName);
      return job.nextDate().toJSDate();
    } catch {
      return null;
    }
  }

  private getCronExpression(jobName: string): string | null {
    try {
      const job = this.schedulerRegistry.getCronJob(jobName);
      return job.cronTime.source as string;
    } catch {
      return null;
    }
  }
}
