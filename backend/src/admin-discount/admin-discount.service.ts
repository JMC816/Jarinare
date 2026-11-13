import { HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AppException } from "../common/errors/app.exception";
import { ErrorCode } from "../common/errors/error-code";
import { AuditService } from "../audit/audit.service";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import type { CreateCardDiscountDto, UpdateCardDiscountDto } from "./dto/admin-discount.dto";

function serializeDiscount(d: Record<string, unknown>) {
  return {
    ...d,
    id: (d.id as bigint).toString(),
    discountRate: Number(d.discountRate),
    paybackRate: Number(d.paybackRate),
  };
}

@Injectable()
export class AdminDiscountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async listDiscounts() {
    const discounts = await this.prisma.cardDiscount.findMany({
      orderBy: { createdAt: "desc" },
    });
    return discounts.map((d) => serializeDiscount(d as unknown as Record<string, unknown>));
  }

  async getDiscount(id: bigint) {
    const discount = await this.prisma.cardDiscount.findUnique({ where: { id } });
    if (!discount) throw new AppException(ErrorCode.NOT_FOUND, "카드 할인을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
    return serializeDiscount(discount as unknown as Record<string, unknown>);
  }

  async createDiscount(dto: CreateCardDiscountDto, actor: AuthUser, ip: string | undefined) {
    // discountRate는 value 기반으로 동기화 (rate 타입이면 value/10000, amount면 0)
    const discountRate = dto.discountType === "rate" ? dto.value / 10000 : 0;

    const discount = await this.prisma.cardDiscount.create({
      data: {
        cardCode: dto.cardCode,
        cardName: dto.cardName,
        discountType: dto.discountType,
        value: dto.value,
        maxDiscount: dto.maxDiscount ?? null,
        minPayment: dto.minPayment ?? 0,
        discountRate,
        paybackRate: dto.paybackRate ?? 0,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
      },
    });

    this.audit.log({
      actorIdx: actor.idx,
      action: "card_discount.create",
      targetType: "card_discount",
      targetId: discount.id.toString(),
      after: dto,
      ip,
    });

    return serializeDiscount(discount as unknown as Record<string, unknown>);
  }

  async updateDiscount(id: bigint, dto: UpdateCardDiscountDto, actor: AuthUser, ip: string | undefined) {
    const discount = await this.prisma.cardDiscount.findUnique({ where: { id } });
    if (!discount) throw new AppException(ErrorCode.NOT_FOUND, "카드 할인을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);

    const before = serializeDiscount(discount as unknown as Record<string, unknown>);

    const discountType = dto.discountType ?? discount.discountType;
    const value = dto.value ?? discount.value;
    const discountRate = discountType === "rate" ? value / 10000 : 0;

    const updated = await this.prisma.cardDiscount.update({
      where: { id },
      data: {
        ...(dto.cardName !== undefined ? { cardName: dto.cardName } : {}),
        ...(dto.discountType !== undefined ? { discountType: dto.discountType } : {}),
        ...(dto.value !== undefined ? { value: dto.value } : {}),
        ...(dto.maxDiscount !== undefined ? { maxDiscount: dto.maxDiscount } : {}),
        ...(dto.minPayment !== undefined ? { minPayment: dto.minPayment } : {}),
        ...(dto.paybackRate !== undefined ? { paybackRate: dto.paybackRate } : {}),
        ...(dto.startsAt !== undefined ? { startsAt: new Date(dto.startsAt) } : {}),
        ...(dto.endsAt !== undefined ? { endsAt: new Date(dto.endsAt) } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        discountRate,
      },
    });

    this.audit.log({
      actorIdx: actor.idx,
      action: "card_discount.update",
      targetType: "card_discount",
      targetId: id.toString(),
      before,
      after: dto,
      ip,
    });

    return serializeDiscount(updated as unknown as Record<string, unknown>);
  }

  async deleteDiscount(id: bigint, actor: AuthUser, ip: string | undefined) {
    const discount = await this.prisma.cardDiscount.findUnique({ where: { id } });
    if (!discount) throw new AppException(ErrorCode.NOT_FOUND, "카드 할인을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);

    await this.prisma.cardDiscount.delete({ where: { id } });

    this.audit.log({
      actorIdx: actor.idx,
      action: "card_discount.delete",
      targetType: "card_discount",
      targetId: id.toString(),
      before: { cardCode: discount.cardCode, cardName: discount.cardName },
      ip,
    });

    return { success: true };
  }
}
