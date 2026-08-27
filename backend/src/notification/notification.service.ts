// @role: features/notification
// @rule: DB 저장 및 SSE push만 담당
import { HttpStatus, Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { AppException } from "../common/errors/app.exception";
import { ErrorCode } from "../common/errors/error-code";
import { SseService } from "./sse.service";
import { NotificationQueueService } from "./notification-queue.service";

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sseService: SseService,
    private readonly notificationQueue: NotificationQueueService,
  ) {}

  create(userIdx: bigint, type: string, payload: object): void {
    this.notificationQueue.enqueue(userIdx, type, payload);
  }

  async getList(user: AuthUser) {
    const now = new Date();
    // 이전달 1일부터 조회 — 파티션 프루닝으로 2개 파티션만 스캔
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const notifications = await this.prisma.notification.findMany({
      where: {
        userIdx: BigInt(user.idx),
        createdAt: { gte: start },
      },
      orderBy: { createdAt: "desc" },
    });

    return notifications.map((n) => ({
      id: Number(n.id),
      type: n.type,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
      payload: n.payload,
    }));
  }

  // createdAt 범위 필터로 MySQL 파티션 프루닝 활성화
  async getListByMonth(year: number, month: number, user: AuthUser) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const notifications = await this.prisma.notification.findMany({
      where: {
        userIdx: BigInt(user.idx),
        createdAt: { gte: start, lt: end },
      },
      orderBy: { createdAt: "desc" },
    });

    return notifications.map((n) => ({
      id: Number(n.id),
      type: n.type,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
      payload: n.payload,
    }));
  }

  async markAsRead(
    dto: { id: number; type: string; isRead: boolean },
    user: AuthUser,
  ): Promise<{ message: string }> {
    await this.prisma.notification.updateMany({
      where: { id: BigInt(dto.id), userIdx: BigInt(user.idx), type: dto.type },
      data: { isRead: dto.isRead },
    });
    return { message: "수정되었습니다." };
  }

  async markAllAsRead(user: AuthUser): Promise<{ message: string }> {
    await this.prisma.notification.updateMany({
      where: { userIdx: BigInt(user.idx), isRead: false },
      data: { isRead: true },
    });
    return { message: "전체 읽음 처리되었습니다." };
  }

  async delete(
    dto: { id: number; type: string },
    user: AuthUser,
  ): Promise<{ message: string }> {
    await this.prisma.notification.deleteMany({
      where: { id: BigInt(dto.id), userIdx: BigInt(user.idx), type: dto.type },
    });
    return { message: "삭제되었습니다." };
  }

  async dropPartition(year: number, month: number): Promise<{ message: string }> {
    const pName = `p_${year}_${String(month).padStart(2, "0")}`;

    const rows = await this.prisma.$queryRawUnsafe<{ cnt: number }[]>(`
      SELECT COUNT(*) AS cnt
      FROM INFORMATION_SCHEMA.PARTITIONS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'notifications'
        AND PARTITION_NAME = '${pName}'
    `);

    if (!rows[0] || Number(rows[0].cnt) === 0) {
      throw new AppException(
        ErrorCode.NOT_FOUND,
        `${year}년 ${month}월 파티션이 존재하지 않습니다.`,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.prisma.$executeRawUnsafe(`
      ALTER TABLE notifications DROP PARTITION \`${pName}\`
    `);
    return { message: `${year}년 ${month}월 알림 파티션이 삭제되었습니다.` };
  }

  // 매월 1일 00:10 — 2달 전 파티션 DROP (이전달 + 이번달만 유지)
  @Cron("10 0 1 * *")
  async dropOldPartition(): Promise<void> {
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const year = target.getFullYear();
    const month = target.getMonth() + 1;

    try {
      await this.dropPartition(year, month);
    } catch {
      // 파티션이 없으면 무시
    }
  }

  // 매월 1일 00:05 — 다음달 파티션을 ADD PARTITION으로 미리 생성
  @Cron("5 0 1 * *")
  async createNextMonthPartition(): Promise<void> {
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const year = target.getFullYear();
    const month = target.getMonth() + 1; // 1~12

    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const upperBound = nextYear * 100 + nextMonth;

    const pName = `p_${year}_${String(month).padStart(2, "0")}`;

    try {
      await this.prisma.$executeRawUnsafe(`
        ALTER TABLE notifications
        ADD PARTITION (
          PARTITION \`${pName}\` VALUES LESS THAN (${upperBound})
        )
      `);
    } catch {
      // 이미 존재하는 파티션이면 무시
    }
  }
}
