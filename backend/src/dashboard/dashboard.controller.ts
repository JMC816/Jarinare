// @role: features/dashboard
// @rule: 어드민 대시보드 조회만 담당
import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Permissions } from "../auth/decorators/permissions.decorator";
import { DashboardService } from "./dashboard.service";
import { DashboardQueryDto } from "./dto/dashboard.dto";

@ApiTags("admin/dashboard")
@ApiBearerAuth()
@Controller("admin/dashboard")
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get("summary")
  @Permissions("dashboard:read")
  @ApiOperation({ summary: "대시보드 요약 통계" })
  getSummary(@Query() query: DashboardQueryDto) {
    return this.dashboard.getSummary(query.from, query.to);
  }

  @Get("reservations/daily")
  @Permissions("dashboard:read")
  @ApiOperation({ summary: "시간대별 예매 추이" })
  getDailyReservations(@Query() query: DashboardQueryDto) {
    return this.dashboard.getDailyReservations(query.from, query.to);
  }
}
