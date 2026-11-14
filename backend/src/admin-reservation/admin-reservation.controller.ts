import { Controller, Delete, Get, Param, Post, Query, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { Permissions } from "../auth/decorators/permissions.decorator";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { AdminReservationService } from "./admin-reservation.service";
import { ReservationListQueryDto, SeatChangeListQueryDto } from "./dto/admin-reservation.dto";

@ApiBearerAuth()
@ApiTags("Admin - 예매·좌석 관리")
@Controller("admin/reservations")
export class AdminReservationController {
  constructor(private readonly adminReservation: AdminReservationService) {}

  @Get()
  @ApiOperation({ summary: "예매 목록 (status·검색 필터)" })
  @Permissions("reservation:read")
  listReservations(@Query() query: ReservationListQueryDto) {
    return this.adminReservation.listReservations(query);
  }

  @Get("seat-changes")
  @ApiOperation({ summary: "좌석 변경 요청 목록" })
  @Permissions("reservation:read")
  listSeatChanges(@Query() query: SeatChangeListQueryDto) {
    return this.adminReservation.listSeatChanges(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "예매 상세" })
  @Permissions("reservation:read")
  getReservation(@Param("id") id: string) {
    return this.adminReservation.getReservation(BigInt(id));
  }

  @Post(":id/cancel")
  @ApiOperation({ summary: "예매 강제 취소" })
  @Permissions("reservation:manage")
  cancelReservation(@Param("id") id: string, @Req() req: Request & { user: AuthUser }) {
    return this.adminReservation.cancelReservation(BigInt(id), req.user, req.ip);
  }
}
