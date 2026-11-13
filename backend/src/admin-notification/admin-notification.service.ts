import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { NotificationService } from "../notification/notification.service";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import type { SendNotificationDto } from "./dto/admin-notification.dto";

@Injectable()
export class AdminNotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notification: NotificationService,
    private readonly audit: AuditService,
  ) {}

  async send(dto: SendNotificationDto, actor: AuthUser, ip: string | undefined) {
    const payload = { title: dto.title, body: dto.body };

    let targetIdxList: bigint[];

    if (dto.targetUserIdxList && dto.targetUserIdxList.length > 0) {
      targetIdxList = dto.targetUserIdxList.map((i) => BigInt(i));
    } else {
      // 전체 발송 — active 유저 idx 조회
      const users = await this.prisma.user.findMany({
        where: { status: "active" },
        select: { idx: true },
      });
      targetIdxList = users.map((u) => u.idx);
    }

    await Promise.all(
      targetIdxList.map((idx) => this.notification.create(idx, "announcement", payload)),
    );

    this.audit.log({
      actorIdx: actor.idx,
      action: "notification.send",
      targetType: "notification",
      targetId: "broadcast",
      after: { title: dto.title, count: targetIdxList.length },
      ip,
    });

    return { success: true, sentCount: targetIdxList.length };
  }
}
