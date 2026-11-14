import { HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AppException } from "../common/errors/app.exception";
import { ErrorCode } from "../common/errors/error-code";
import { AuditService } from "../audit/audit.service";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import type { CreateReportDto, ReportListQueryDto, ResolveReportDto } from "./dto/admin-reports.dto";

const PAGE_SIZE = 20;

function serializeReport(r: Record<string, unknown>) {
  return {
    ...r,
    id: (r.id as bigint).toString(),
    reporterIdx: (r.reporterIdx as bigint).toString(),
    targetId: (r.targetId as bigint).toString(),
    handlerIdx: r.handlerIdx ? (r.handlerIdx as bigint).toString() : null,
  };
}

@Injectable()
export class AdminReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async createReport(dto: CreateReportDto, reporterIdx: bigint) {
    const existing = await this.prisma.report.findFirst({
      where: { reporterIdx, targetType: dto.targetType, targetId: BigInt(dto.targetId) },
    });
    if (existing) {
      throw new AppException(ErrorCode.CONFLICT, "이미 신고한 대상입니다.", HttpStatus.CONFLICT);
    }

    const report = await this.prisma.report.create({
      data: {
        reporterIdx,
        targetType: dto.targetType,
        targetId: BigInt(dto.targetId),
        reasonCode: dto.reasonCode,
        detail: dto.detail ?? null,
      },
    });

    return serializeReport(report as unknown as Record<string, unknown>);
  }

  async listReports(query: ReportListQueryDto) {
    const page = query.page ?? 1;
    const skip = (page - 1) * PAGE_SIZE;
    const where = query.status ? { status: query.status } : {};

    const [total, reports] = await this.prisma.$transaction([
      this.prisma.report.count({ where }),
      this.prisma.report.findMany({
        where,
        skip,
        take: PAGE_SIZE,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      data: reports.map((r) => serializeReport(r as unknown as Record<string, unknown>)),
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
    };
  }

  async getReport(id: bigint) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) throw new AppException(ErrorCode.NOT_FOUND, "신고를 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
    return serializeReport(report as unknown as Record<string, unknown>);
  }

  async resolveReport(id: bigint, dto: ResolveReportDto, actor: AuthUser, ip: string | undefined) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) throw new AppException(ErrorCode.NOT_FOUND, "신고를 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
    if (report.status === "RESOLVED" || report.status === "REJECTED") {
      throw new AppException(ErrorCode.CONFLICT, "이미 처리된 신고입니다.", HttpStatus.CONFLICT);
    }

    const before = { status: report.status, action: report.action };

    const updated = await this.prisma.report.update({
      where: { id },
      data: {
        status: dto.status,
        action: dto.action ?? null,
        handlerIdx: BigInt(actor.idx),
        handlerMemo: dto.memo ?? null,
        handledAt: new Date(),
      },
    });

    // action이 hide면 대상 콘텐츠 숨김 처리
    if (dto.action === "hide") {
      await this.applyHide(report.targetType, report.targetId);
    }

    this.audit.log({
      actorIdx: actor.idx,
      action: "report.resolve",
      targetType: "report",
      targetId: id.toString(),
      before,
      after: { status: dto.status, action: dto.action, memo: dto.memo },
      ip,
    });

    return serializeReport(updated as unknown as Record<string, unknown>);
  }

  async rejectReport(id: bigint, memo: string | undefined, actor: AuthUser, ip: string | undefined) {
    return this.resolveReport(id, { status: "REJECTED", memo }, actor, ip);
  }

  private async applyHide(targetType: string, targetId: bigint) {
    if (targetType === "board") {
      await this.prisma.board.update({ where: { id: targetId }, data: { isHidden: true } }).catch(() => null);
    } else if (targetType === "comment") {
      await this.prisma.comment.update({ where: { id: targetId }, data: { isHidden: true } }).catch(() => null);
    }
  }
}
