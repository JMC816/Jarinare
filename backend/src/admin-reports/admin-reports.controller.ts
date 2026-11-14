import { Body, Controller, Get, Param, Post, Query, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { Permissions } from "../auth/decorators/permissions.decorator";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { AdminReportsService } from "./admin-reports.service";
import { RejectReportDto, ReportListQueryDto, ResolveReportDto } from "./dto/admin-reports.dto";

@ApiBearerAuth()
@ApiTags("Admin - 신고 처리")
@Controller("admin/reports")
export class AdminReportsController {
  constructor(private readonly adminReports: AdminReportsService) {}

  @Get()
  @ApiOperation({ summary: "신고 목록" })
  @Permissions("report:read")
  listReports(@Query() query: ReportListQueryDto) {
    return this.adminReports.listReports(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "신고 상세" })
  @Permissions("report:read")
  getReport(@Param("id") id: string) {
    return this.adminReports.getReport(BigInt(id));
  }

  @Post(":id/resolve")
  @ApiOperation({ summary: "신고 처리 완료 (action, memo)" })
  @Permissions("report:resolve")
  resolveReport(
    @Param("id") id: string,
    @Body() dto: ResolveReportDto,
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.adminReports.resolveReport(BigInt(id), dto, req.user, req.ip);
  }

  @Post(":id/reject")
  @ApiOperation({ summary: "신고 거절" })
  @Permissions("report:resolve")
  rejectReport(
    @Param("id") id: string,
    @Body() dto: RejectReportDto,
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.adminReports.rejectReport(BigInt(id), dto.memo, req.user, req.ip);
  }
}
