import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationService } from "../notification/notification.service";

@Injectable()
export class SchedulerAlertService {
  private readonly logger = new Logger(SchedulerAlertService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notification: NotificationService,
  ) {}

  async notifyAdminsOnFailure(
    jobName: string,
    runId: bigint,
    errorMessage: string,
  ): Promise<void> {
    try {
      const admins = await this.prisma.user.findMany({
        where: { adminRoleId: { not: null } },
        select: { idx: true },
      });

      await Promise.all(
        admins.map((a) =>
          this.notification.create(a.idx, "announcement", {
            title: "스케줄러 작업 실패",
            jobName,
            runId: runId.toString(),
            errorMessage: errorMessage.slice(0, 200),
          }),
        ),
      );
      this.logger.log(
        `어드민 ${admins.length}명에게 실패 알림 발송 (jobName=${jobName}, runId=${runId})`,
      );
    } catch (e) {
      this.logger.error(
        `어드민 실패 알림 발송 실패: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }
}
