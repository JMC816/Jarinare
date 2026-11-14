import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { AdminReportsService } from "./admin-reports.service";
import { CreateReportDto } from "./dto/admin-reports.dto";

@ApiBearerAuth()
@ApiTags("신고")
@Controller("reports")
export class ReportsController {
  constructor(private readonly reports: AdminReportsService) {}

  @Post()
  @ApiOperation({ summary: "신고 접수 (로그인 필수)" })
  create(@Body() dto: CreateReportDto, @Req() req: Request & { user: AuthUser }) {
    return this.reports.createReport(dto, BigInt(req.user.idx));
  }
}
