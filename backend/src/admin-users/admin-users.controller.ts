import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { Permissions } from "../auth/decorators/permissions.decorator";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { AdminUsersService } from "./admin-users.service";
import {
  AdminUserListQueryDto,
  AdjustPointDto,
  SuspendUserDto,
} from "./dto/admin-users.dto";

@ApiBearerAuth()
@ApiTags("Admin - 회원 관리")
@Controller("admin/users")
export class AdminUsersController {
  constructor(private readonly adminUsers: AdminUsersService) {}

  @Get()
  @ApiOperation({ summary: "회원 목록 조회 (마스킹)" })
  @Permissions("user:read")
  listUsers(@Query() query: AdminUserListQueryDto) {
    return this.adminUsers.listUsers(query);
  }

  @Get(":idx")
  @ApiOperation({ summary: "회원 상세 조회 (기본: 마스킹, ?full=1: 원문 + 감사로그)" })
  @Permissions("user:read")
  getUser(
    @Param("idx") idx: string,
    @Query("full") full: string | undefined,
    @Req() req: Request & { user: AuthUser },
  ) {
    const ip = req.ip;
    return this.adminUsers.getUser(BigInt(idx), req.user, ip, full === "1");
  }

  @Post(":idx/suspend")
  @ApiOperation({ summary: "회원 정지" })
  @Permissions("user:suspend")
  suspend(
    @Param("idx") idx: string,
    @Body() dto: SuspendUserDto,
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.adminUsers.suspendUser(BigInt(idx), dto, req.user, req.ip);
  }

  @Post(":idx/unsuspend")
  @ApiOperation({ summary: "회원 정지 해제" })
  @Permissions("user:suspend")
  unsuspend(
    @Param("idx") idx: string,
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.adminUsers.unsuspendUser(BigInt(idx), req.user, req.ip);
  }

  @Post(":idx/force-logout")
  @ApiOperation({ summary: "강제 로그아웃 (refreshToken 무효화)" })
  @Permissions("user:suspend")
  forceLogout(
    @Param("idx") idx: string,
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.adminUsers.forceLogout(BigInt(idx), req.user, req.ip);
  }

  @Post(":idx/points")
  @ApiOperation({ summary: "포인트 지급·차감" })
  @Permissions("point:adjust")
  adjustPoints(
    @Param("idx") idx: string,
    @Body() dto: AdjustPointDto,
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.adminUsers.adjustPoints(BigInt(idx), dto, req.user, req.ip);
  }
}
