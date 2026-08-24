// @role: features/notification
// @rule: DB 저장 및 SSE push만 담당
import { Injectable } from "@nestjs/common";
import { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { SseService } from "./sse.service";

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sseService: SseService,
  ) {}

  async create(userIdx: bigint, type: string, payload: object): Promise<void> {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          userIdx,
          type,
          payload: payload as Prisma.InputJsonValue,
        },
      });

      this.sseService.push(Number(userIdx), {
        id: Number(notification.id),
        type: notification.type,
        isRead: notification.isRead,
        createdAt: notification.createdAt.toISOString(),
        payload,
      });
    } catch {
      // 알림 실패는 무시 (댓글 저장에 영향 없음)
    }
  }

  async getList(user: AuthUser) {
    const notifications = await this.prisma.notification.findMany({
      where: { userIdx: BigInt(user.idx) },
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
}
