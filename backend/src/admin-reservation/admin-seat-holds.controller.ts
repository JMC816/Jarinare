import { Controller, Delete, Param, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { Permissions } from "../auth/decorators/permissions.decorator";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { AdminReservationService } from "./admin-reservation.service";

@ApiBearerAuth()
@ApiTags("Admin - 예매·좌석 관리")
@Controller("admin/seat-holds")
export class AdminSeatHoldsController {
  constructor(private readonly adminReservation: AdminReservationService) {}

  @Delete(":id")
  @ApiOperation({ summary: "좌석 선점 강제 해제" })
  @Permissions("reservation:manage")
  deleteSeatHold(@Param("id") id: string, @Req() req: Request & { user: AuthUser }) {
    return this.adminReservation.deleteSeatHold(BigInt(id), req.user, req.ip);
  }
}
