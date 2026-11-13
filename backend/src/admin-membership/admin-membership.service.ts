import { HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AppException } from "../common/errors/app.exception";
import { ErrorCode } from "../common/errors/error-code";
import { AuditService } from "../audit/audit.service";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import type { CreateMembershipTierDto, UpdateMembershipTierDto } from "./dto/admin-membership.dto";

function serializeTier(t: Record<string, unknown>) {
  return {
    ...t,
    id: (t.id as bigint).toString(),
    discountRate: Number(t.discountRate),
    pointRate: Number(t.pointRate),
  };
}

@Injectable()
export class AdminMembershipService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async listTiers() {
    const tiers = await this.prisma.membershipTier.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return tiers.map((t) => serializeTier(t as unknown as Record<string, unknown>));
  }

  async getTier(id: bigint) {
    const tier = await this.prisma.membershipTier.findUnique({ where: { id } });
    if (!tier) throw new AppException(ErrorCode.NOT_FOUND, "멤버십 등급을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
    return serializeTier(tier as unknown as Record<string, unknown>);
  }

  async createTier(dto: CreateMembershipTierDto, actor: AuthUser, ip: string | undefined) {
    const tier = await this.prisma.membershipTier.create({
      data: {
        name: dto.name,
        sortOrder: dto.sortOrder,
        minTotalPaid: dto.minTotalPaid ?? 0,
        minRideCount: dto.minRideCount ?? 0,
        discountRate: dto.discountRate ?? 0,
        pointRate: dto.pointRate ?? 0,
        freeSeatChanges: dto.freeSeatChanges ?? 0,
      },
    });

    this.audit.log({
      actorIdx: actor.idx,
      action: "membership_tier.create",
      targetType: "membership_tier",
      targetId: tier.id.toString(),
      after: dto,
      ip,
    });

    return serializeTier(tier as unknown as Record<string, unknown>);
  }

  async updateTier(id: bigint, dto: UpdateMembershipTierDto, actor: AuthUser, ip: string | undefined) {
    const tier = await this.prisma.membershipTier.findUnique({ where: { id } });
    if (!tier) throw new AppException(ErrorCode.NOT_FOUND, "멤버십 등급을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);

    const before = serializeTier(tier as unknown as Record<string, unknown>);
    const updated = await this.prisma.membershipTier.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
        ...(dto.minTotalPaid !== undefined ? { minTotalPaid: dto.minTotalPaid } : {}),
        ...(dto.minRideCount !== undefined ? { minRideCount: dto.minRideCount } : {}),
        ...(dto.discountRate !== undefined ? { discountRate: dto.discountRate } : {}),
        ...(dto.pointRate !== undefined ? { pointRate: dto.pointRate } : {}),
        ...(dto.freeSeatChanges !== undefined ? { freeSeatChanges: dto.freeSeatChanges } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });

    this.audit.log({
      actorIdx: actor.idx,
      action: "membership_tier.update",
      targetType: "membership_tier",
      targetId: id.toString(),
      before,
      after: dto,
      ip,
    });

    return serializeTier(updated as unknown as Record<string, unknown>);
  }

  async deleteTier(id: bigint, actor: AuthUser, ip: string | undefined) {
    const tier = await this.prisma.membershipTier.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });
    if (!tier) throw new AppException(ErrorCode.NOT_FOUND, "멤버십 등급을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
    if (tier._count.users > 0) {
      throw new AppException(ErrorCode.CONFLICT, "해당 등급을 보유한 회원이 있습니다.", HttpStatus.CONFLICT);
    }

    await this.prisma.membershipTier.delete({ where: { id } });

    this.audit.log({
      actorIdx: actor.idx,
      action: "membership_tier.delete",
      targetType: "membership_tier",
      targetId: id.toString(),
      before: { name: tier.name },
      ip,
    });

    return { success: true };
  }
}
