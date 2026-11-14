import { HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AppException } from "../common/errors/app.exception";
import { ErrorCode } from "../common/errors/error-code";
import { AuditService } from "../audit/audit.service";
import { ACTIVE } from "../seat/seat.constants";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import type { ReservationListQueryDto, SeatChangeListQueryDto } from "./dto/admin-reservation.dto";

const PAGE_SIZE = 20;

function serializeReservation(r: Record<string, unknown>) {
  const canceledAt = r.canceledAt as Date;
  return {
    ...r,
    id: (r.id as bigint).toString(),
    tripId: (r.tripId as bigint).toString(),
    userIdx: (r.userIdx as bigint).toString(),
    status: canceledAt.getTime() === ACTIVE.getTime() ? "active" : "canceled",
  };
}

function serializeSeatChange(s: Record<string, unknown>) {
  return {
    ...s,
    id: (s.id as bigint).toString(),
    tripId: (s.tripId as bigint).toString(),
    requesterIdx: (s.requesterIdx as bigint).toString(),
    targetIdx: (s.targetIdx as bigint).toString(),
  };
}

@Injectable()
export class AdminReservationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ── 예매 ──────────────────────────────────────────────

  async listReservations(query: ReservationListQueryDto) {
    const page = query.page ?? 1;
    const skip = (page - 1) * PAGE_SIZE;

    const where: Record<string, unknown> = {};

    if (query.status === "active") {
      where.canceledAt = ACTIVE;
    } else if (query.status === "canceled") {
      where.canceledAt = { not: ACTIVE };
    }

    if (query.q) {
      const q = query.q.trim();
      const idxNum = /^\d+$/.test(q) ? BigInt(q) : null;
      where.OR = [
        { orderId: { contains: q } },
        ...(idxNum ? [{ userIdx: idxNum }] : []),
      ];
    }

    const [total, reservations] = await this.prisma.$transaction([
      this.prisma.reservation.count({ where }),
      this.prisma.reservation.findMany({
        where,
        skip,
        take: PAGE_SIZE,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          trip: { select: { trainNo: true, depName: true, arrName: true } },
        },
      }),
    ]);

    return {
      data: reservations.map((r) => serializeReservation(r as unknown as Record<string, unknown>)),
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
    };
  }

  async getReservation(id: bigint) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        trip: { select: { trainNo: true, depName: true, arrName: true, adultcharge: true } },
      },
    });
    if (!reservation) throw new AppException(ErrorCode.RESERVATION_NOT_FOUND, "예매를 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
    return serializeReservation(reservation as unknown as Record<string, unknown>);
  }

  async cancelReservation(id: bigint, actor: AuthUser, ip: string | undefined) {
    const reservation = await this.prisma.reservation.findUnique({ where: { id } });
    if (!reservation) throw new AppException(ErrorCode.RESERVATION_NOT_FOUND, "예매를 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
    if (reservation.canceledAt.getTime() !== ACTIVE.getTime()) {
      throw new AppException(ErrorCode.CONFLICT, "이미 취소된 예매입니다.", HttpStatus.CONFLICT);
    }

    await this.prisma.reservation.update({
      where: { id },
      data: { canceledAt: new Date() },
    });

    this.audit.log({
      actorIdx: actor.idx,
      action: "reservation.cancel",
      targetType: "reservation",
      targetId: id.toString(),
      before: { status: "active" },
      after: { status: "canceled" },
      ip,
    });

    return { success: true };
  }

  // ── 좌석 선점 ─────────────────────────────────────────

  async deleteSeatHold(id: bigint, actor: AuthUser, ip: string | undefined) {
    const hold = await this.prisma.seatHold.findUnique({ where: { id } });
    if (!hold) throw new AppException(ErrorCode.NOT_FOUND, "좌석 선점 정보를 찾을 수 없습니다.", HttpStatus.NOT_FOUND);

    await this.prisma.seatHold.delete({ where: { id } });

    this.audit.log({
      actorIdx: actor.idx,
      action: "seat_hold.force_delete",
      targetType: "seat_hold",
      targetId: id.toString(),
      before: { userIdx: hold.userIdx.toString(), tripId: hold.tripId.toString(), seatId: hold.seatId },
      ip,
    });

    return { success: true };
  }

  // ── 좌석 변경 요청 ────────────────────────────────────

  async listSeatChanges(query: SeatChangeListQueryDto) {
    const page = query.page ?? 1;
    const skip = (page - 1) * PAGE_SIZE;
    const where = query.status ? { status: query.status } : {};

    const [total, requests] = await this.prisma.$transaction([
      this.prisma.seatChangeRequest.count({ where }),
      this.prisma.seatChangeRequest.findMany({
        where,
        skip,
        take: PAGE_SIZE,
        orderBy: { createdAt: "desc" },
        include: {
          requester: { select: { name: true } },
          target: { select: { name: true } },
          trip: { select: { trainNo: true, depName: true, arrName: true } },
        },
      }),
    ]);

    return {
      data: requests.map((s) => serializeSeatChange(s as unknown as Record<string, unknown>)),
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
    };
  }
}
