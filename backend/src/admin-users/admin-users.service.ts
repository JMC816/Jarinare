import { HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AppException } from "../common/errors/app.exception";
import { ErrorCode } from "../common/errors/error-code";
import { AuditService } from "../audit/audit.service";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import type { AdminUserListQueryDto, AdjustPointDto, SuspendUserDto, UpdateMembershipDto } from "./dto/admin-users.dto";

const PAGE_SIZE = 20;

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  const visible = local.length > 2 ? local.slice(0, 2) : local.slice(0, 1);
  return `${visible}${"*".repeat(local.length - visible.length)}@${domain}`;
}

function maskName(name: string): string {
  if (name.length <= 1) return "*";
  return name[0] + "*".repeat(name.length - 1);
}

function serializeUser(u: Record<string, unknown>, masked: boolean) {
  const email = u.email as string;
  const name = u.name as string;
  return {
    idx: (u.idx as bigint).toString(),
    email: masked ? maskEmail(email) : email,
    name: masked ? maskName(name) : name,
    status: u.status,
    suspendedUntil: u.suspendedUntil,
    suspendReason: u.suspendReason,
    membershipTierId: u.membershipTierId ? String(u.membershipTierId as bigint) : null,
    createdAt: u.createdAt,
  };
}

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async listUsers(query: AdminUserListQueryDto) {
    const page = query.page ?? 1;
    const skip = (page - 1) * PAGE_SIZE;

    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;
    if (query.q) {
      const q = query.q.trim();
      const idxNum = /^\d+$/.test(q) ? BigInt(q) : null;
      where.OR = [
        { email: { contains: q } },
        { name: { contains: q } },
        ...(idxNum ? [{ idx: idxNum }] : []),
      ];
    }

    const [total, users] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: PAGE_SIZE,
        orderBy: { createdAt: "desc" },
        select: {
          idx: true,
          email: true,
          name: true,
          status: true,
          suspendedUntil: true,
          suspendReason: true,
          membershipTierId: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      data: users.map((u) => serializeUser(u as unknown as Record<string, unknown>, true)),
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
    };
  }

  async getUser(targetIdx: bigint, actor: AuthUser, ip: string | undefined, viewFull: boolean) {
    const user = await this.prisma.user.findUnique({
      where: { idx: targetIdx },
      select: {
        idx: true,
        email: true,
        name: true,
        status: true,
        suspendedUntil: true,
        suspendReason: true,
        membershipTierId: true,
        createdAt: true,
      },
    });
    if (!user) throw new AppException(ErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다.", HttpStatus.NOT_FOUND);

    if (viewFull) {
      this.audit.log({
        actorIdx: actor.idx,
        action: "user.view_full",
        targetType: "user",
        targetId: targetIdx.toString(),
        ip,
      });
    }

    return serializeUser(user as unknown as Record<string, unknown>, !viewFull);
  }

  async suspendUser(targetIdx: bigint, dto: SuspendUserDto, actor: AuthUser, ip: string | undefined) {
    const user = await this.prisma.user.findUnique({ where: { idx: targetIdx } });
    if (!user) throw new AppException(ErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다.", HttpStatus.NOT_FOUND);

    const before = { status: user.status, suspendedUntil: user.suspendedUntil, suspendReason: user.suspendReason };
    const until = new Date(dto.until);

    await this.prisma.user.update({
      where: { idx: targetIdx },
      data: { status: "suspended", suspendedUntil: until, suspendReason: dto.reason },
    });

    this.audit.log({
      actorIdx: actor.idx,
      action: "user.suspend",
      targetType: "user",
      targetId: targetIdx.toString(),
      before,
      after: { status: "suspended", suspendedUntil: until, suspendReason: dto.reason },
      reason: dto.reason,
      ip,
    });

    return { success: true };
  }

  async unsuspendUser(targetIdx: bigint, actor: AuthUser, ip: string | undefined) {
    const user = await this.prisma.user.findUnique({ where: { idx: targetIdx } });
    if (!user) throw new AppException(ErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다.", HttpStatus.NOT_FOUND);

    const before = { status: user.status, suspendedUntil: user.suspendedUntil };

    await this.prisma.user.update({
      where: { idx: targetIdx },
      data: { status: "active", suspendedUntil: null, suspendReason: null },
    });

    this.audit.log({
      actorIdx: actor.idx,
      action: "user.unsuspend",
      targetType: "user",
      targetId: targetIdx.toString(),
      before,
      after: { status: "active" },
      ip,
    });

    return { success: true };
  }

  async forceLogout(targetIdx: bigint, actor: AuthUser, ip: string | undefined) {
    const user = await this.prisma.user.findUnique({ where: { idx: targetIdx } });
    if (!user) throw new AppException(ErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다.", HttpStatus.NOT_FOUND);

    // refreshToken 무효화로 강제 로그아웃 처리
    await this.prisma.user.update({
      where: { idx: targetIdx },
      data: { refreshToken: null },
    });

    this.audit.log({
      actorIdx: actor.idx,
      action: "user.force_logout",
      targetType: "user",
      targetId: targetIdx.toString(),
      ip,
    });

    return { success: true };
  }

  async updateMembership(targetIdx: bigint, dto: UpdateMembershipDto, actor: AuthUser, ip: string | undefined) {
    const user = await this.prisma.user.findUnique({ where: { idx: targetIdx } });
    if (!user) throw new AppException(ErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다.", HttpStatus.NOT_FOUND);

    if (dto.membershipTierId !== null) {
      const tier = await this.prisma.membershipTier.findUnique({ where: { id: BigInt(dto.membershipTierId) } });
      if (!tier) throw new AppException(ErrorCode.NOT_FOUND, "존재하지 않는 멤버십 등급입니다.", HttpStatus.NOT_FOUND);
    }

    const before = { membershipTierId: user.membershipTierId ? user.membershipTierId.toString() : null };

    await this.prisma.user.update({
      where: { idx: targetIdx },
      data: { membershipTierId: dto.membershipTierId !== null ? BigInt(dto.membershipTierId) : null },
    });

    this.audit.log({
      actorIdx: actor.idx,
      action: "user.membership_update",
      targetType: "user",
      targetId: targetIdx.toString(),
      before,
      after: { membershipTierId: dto.membershipTierId },
      ip,
    });

    return { success: true };
  }

  async adjustPoints(targetIdx: bigint, dto: AdjustPointDto, actor: AuthUser, ip: string | undefined) {
    const user = await this.prisma.user.findUnique({ where: { idx: targetIdx } });
    if (!user) throw new AppException(ErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다.", HttpStatus.NOT_FOUND);

    // User 모델에 points 컬럼이 없으므로 감사 로그만 기록 (실제 포인트 테이블 연동 시 확장)
    this.audit.log({
      actorIdx: actor.idx,
      action: "user.point_adjust",
      targetType: "user",
      targetId: targetIdx.toString(),
      before: null,
      after: { amount: dto.amount, reason: dto.reason },
      reason: dto.reason,
      ip,
    });

    return { success: true, amount: dto.amount, reason: dto.reason };
  }
}
