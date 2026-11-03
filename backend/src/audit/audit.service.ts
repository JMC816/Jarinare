import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type {
  AuditLogDetailDto,
  AuditLogItemDto,
  AuditLogListResponseDto,
  AuditLogQueryDto,
} from "./dto/audit-log.dto";

export interface AuditLogEntry {
  actorIdx: number;
  action: string;       // 예: "user.suspend", "card_discount.update"
  targetType: string;   // 예: "user", "card_discount"
  targetId: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
  ip?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger("AUDIT");

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 감사 로그를 기록한다.
   *  1) Winston AUDIT 컨텍스트로 JSON 한 줄 — audit-YYYYMMDD.log 에 라우팅됨.
   *  2) admin_audit_logs DB 저장 — fire-and-forget. 실패해도 어드민 작업 자체는 막지 않는다.
   */
  log(entry: AuditLogEntry): void {
    this.logger.log(JSON.stringify(entry));

    this.prisma.adminAuditLog
      .create({
        data: {
          actorIdx: BigInt(entry.actorIdx),
          action: entry.action,
          targetType: entry.targetType,
          targetId: entry.targetId,
          before:
            entry.before !== undefined
              ? (entry.before as Prisma.InputJsonValue)
              : undefined,
          after:
            entry.after !== undefined
              ? (entry.after as Prisma.InputJsonValue)
              : undefined,
          reason: entry.reason,
          ip: entry.ip,
        },
      })
      .catch((err: Error) => {
        this.logger.error(
          `audit DB 저장 실패 [${entry.action}]: ${err.message}`,
        );
      });
  }

  async list(query: AuditLogQueryDto): Promise<AuditLogListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const skip = (page - 1) * limit;

    const where: Prisma.AdminAuditLogWhereInput = {
      ...(query.actor ? { actorIdx: BigInt(query.actor) } : {}),
      ...(query.targetType ? { targetType: query.targetType } : {}),
      ...(query.targetId ? { targetId: query.targetId } : {}),
      ...(query.action ? { action: query.action } : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.adminAuditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          actorIdx: true,
          action: true,
          targetType: true,
          targetId: true,
          reason: true,
          ip: true,
          createdAt: true,
        },
      }),
      this.prisma.adminAuditLog.count({ where }),
    ]);

    const items: AuditLogItemDto[] = rows.map((r) => ({
      id: r.id.toString(),
      actorIdx: Number(r.actorIdx),
      action: r.action,
      targetType: r.targetType,
      targetId: r.targetId,
      reason: r.reason,
      ip: r.ip,
      createdAt: r.createdAt,
    }));

    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  async get(id: string): Promise<AuditLogDetailDto> {
    const row = await this.prisma.adminAuditLog.findUnique({
      where: { id: BigInt(id) },
    });
    if (!row) throw new NotFoundException("감사 로그를 찾을 수 없습니다.");
    return {
      id: row.id.toString(),
      actorIdx: Number(row.actorIdx),
      action: row.action,
      targetType: row.targetType,
      targetId: row.targetId,
      reason: row.reason,
      ip: row.ip,
      createdAt: row.createdAt,
      before: row.before,
      after: row.after,
    };
  }

  // 매월 1일 00:05 — 1년 지난 감사 로그 삭제
  @Cron("5 0 1 * *")
  async pruneOldLogs(): Promise<void> {
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 1);
    const { count } = await this.prisma.adminAuditLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    if (count > 0) {
      this.logger.log(
        `오래된 감사 로그 ${count}건 삭제 (기준: ${cutoff.toISOString()})`,
      );
    }
  }
}
