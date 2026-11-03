import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface SchedulerRunLogItem {
  runId: string;
  jobName: string;
  status: string;
  startYmd: string;
  endYmd: string;
  startedAt: Date;
  endedAt: Date | null;
  errorMessage: string | null;
  metadata: unknown;
  triggeredBy: string | null;
  params: unknown;
}

@Injectable()
export class SchedulerRunLogService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: {
    limit: number;
    jobName?: string;
    status?: string;
    triggeredBy?: bigint;
  }): Promise<SchedulerRunLogItem[]> {
    const rows = await this.prisma.schedulerRunLog.findMany({
      where: {
        ...(params.jobName ? { jobName: params.jobName } : {}),
        ...(params.status ? { status: params.status } : {}),
        ...(params.triggeredBy !== undefined
          ? { triggeredBy: params.triggeredBy }
          : {}),
      },
      orderBy: { runId: "desc" },
      take: params.limit,
    });
    return rows.map(toItem);
  }

  async get(runId: bigint): Promise<SchedulerRunLogItem> {
    const row = await this.prisma.schedulerRunLog.findUnique({
      where: { runId },
    });
    if (!row) throw new NotFoundException("실행 로그를 찾을 수 없습니다.");
    return toItem(row);
  }

  async summary(): Promise<Record<string, number>> {
    const grouped = await this.prisma.schedulerRunLog.groupBy({
      by: ["status"],
      _count: { _all: true },
    });
    const out: Record<string, number> = {};
    for (const g of grouped) out[g.status] = g._count._all;
    return out;
  }
}

function toItem(r: {
  runId: bigint;
  jobName: string;
  status: string;
  startYmd: string;
  endYmd: string;
  startedAt: Date;
  endedAt: Date | null;
  errorMessage: string | null;
  metadata: unknown;
  triggeredBy: bigint | null;
  params: unknown;
}): SchedulerRunLogItem {
  return {
    runId: r.runId.toString(),
    jobName: r.jobName,
    status: r.status,
    startYmd: r.startYmd,
    endYmd: r.endYmd,
    startedAt: r.startedAt,
    endedAt: r.endedAt,
    errorMessage: r.errorMessage,
    metadata: r.metadata,
    triggeredBy: r.triggeredBy !== null ? r.triggeredBy.toString() : null,
    params: r.params,
  };
}
