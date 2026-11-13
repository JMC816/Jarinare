import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { StationsSyncService } from "../stations/stations-sync.service";
import { TrainTimeSyncService } from "../trains/train-time-sync.service";
import { SeatChangeService } from "../seat/seat-change.service";
import { SeatHoldService } from "../seat/seat-hold.service";
import { NotificationService } from "../notification/notification.service";
import { JobQueueService } from "./job-queue.service";
import { JobStatus } from "./interfaces/job.interface";
import { RunJobDto } from "./dto/run-job.dto";

const KNOWN_JOBS = [
  "station-sync",
  "train-time-sync",
  "notification-rotate",
  "notification-drop",
  "seat-change-expire",
  "seat-hold-expire",
] as const;

type JobName = (typeof KNOWN_JOBS)[number];

export interface JobRunResult {
  runId: string;
  jobName: string;
  status: string;
}

@Injectable()
export class AdminSchedulerRunnerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queue: JobQueueService,
    private readonly stationsSync: StationsSyncService,
    private readonly trainTimeSync: TrainTimeSyncService,
    private readonly seatChange: SeatChangeService,
    private readonly seatHold: SeatHoldService,
    private readonly notification: NotificationService,
  ) {}

  async runJob(
    name: string,
    dto: RunJobDto,
    triggeredBy: bigint,
  ): Promise<JobRunResult> {
    if (!KNOWN_JOBS.includes(name as JobName)) {
      throw new BadRequestException(
        `알 수 없는 잡 이름입니다: ${name}. 허용: ${KNOWN_JOBS.join(", ")}`,
      );
    }

    const runId = await this.enqueueByName(name as JobName, dto, triggeredBy);
    return { runId: runId.toString(), jobName: name, status: "PENDING" };
  }

  async retryRun(runId: bigint, triggeredBy: bigint): Promise<JobRunResult> {
    const original = await this.prisma.schedulerRunLog.findUnique({
      where: { runId },
    });

    if (!original) {
      throw new NotFoundException(`실행 로그를 찾을 수 없습니다: ${runId}`);
    }

    if (
      original.status !== JobStatus.FAILED &&
      original.status !== JobStatus.CANCELLED
    ) {
      throw new BadRequestException(
        "FAILED 또는 CANCELLED 상태인 작업만 재실행할 수 있습니다.",
      );
    }

    const jobName = original.jobName as JobName;
    if (!KNOWN_JOBS.includes(jobName)) {
      throw new BadRequestException(
        `재실행을 지원하지 않는 잡입니다: ${jobName}`,
      );
    }

    // train-time-sync 는 저장된 params 에서 날짜 범위를 복원한다
    const storedParams =
      jobName === "train-time-sync" && original.params
        ? (original.params as { startDate?: string; endDate?: string; days?: number })
        : {};

    const dto: RunJobDto = {
      startDate: (storedParams as RunJobDto).startDate,
      endDate: (storedParams as RunJobDto).endDate,
      days: (storedParams as RunJobDto).days,
    };

    const newRunId = await this.enqueueByName(jobName, dto, triggeredBy);
    return {
      runId: newRunId.toString(),
      jobName,
      status: "PENDING",
    };
  }

  private async enqueueByName(
    name: JobName,
    dto: RunJobDto,
    triggeredBy: bigint,
  ): Promise<bigint> {
    const todayYmd = new Date()
      .toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" })
      .replace(/-/g, "");

    switch (name) {
      case "train-time-sync":
        return this.trainTimeSync.enqueueRange(
          { startDate: dto.startDate, endDate: dto.endDate, days: dto.days },
          triggeredBy,
        );

      case "station-sync":
        return (await this.queue.enqueue({
          jobName: "station-sync",
          startYmd: todayYmd,
          endYmd: todayYmd,
          triggeredBy,
          params: {},
          jobFn: () => this.stationsSync.syncAll(),
        }))!;

      case "seat-change-expire":
        return (await this.queue.enqueue({
          jobName: "seat-change-expire",
          startYmd: todayYmd,
          endYmd: todayYmd,
          triggeredBy,
          params: {},
          jobFn: () => this.seatChange.expireStale(),
        }))!;

      case "seat-hold-expire":
        return (await this.queue.enqueue({
          jobName: "seat-hold-expire",
          startYmd: todayYmd,
          endYmd: todayYmd,
          triggeredBy,
          params: {},
          jobFn: () => this.seatHold.purgeExpired(),
        }))!;

      case "notification-rotate":
        return (await this.queue.enqueue({
          jobName: "notification-rotate",
          startYmd: todayYmd,
          endYmd: todayYmd,
          triggeredBy,
          params: {},
          jobFn: () => this.notification.createNextMonthPartition(),
        }))!;

      case "notification-drop":
        return (await this.queue.enqueue({
          jobName: "notification-drop",
          startYmd: todayYmd,
          endYmd: todayYmd,
          triggeredBy,
          params: {},
          jobFn: () => this.notification.dropOldPartition(),
        }))!;
    }
  }
}
