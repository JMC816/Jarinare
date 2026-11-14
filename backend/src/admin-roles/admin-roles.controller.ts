import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { Permissions } from "../auth/decorators/permissions.decorator";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { AdminRolesService } from "./admin-roles.service";
import {
  AssignAdminDto,
  CreateRoleDto,
  UpdateAdminRoleDto,
  UpdateRoleDto,
} from "./dto/admin-roles.dto";

@ApiBearerAuth()
@ApiTags("Admin - 역할·권한 관리")
@Controller("admin")
export class AdminRolesController {
  constructor(private readonly adminRoles: AdminRolesService) {}

  // ── 역할 ──────────────────────────────────────────────

  @Get("roles")
  @ApiOperation({ summary: "역할 목록" })
  @Permissions("admin:manage")
  listRoles() {
    return this.adminRoles.listRoles();
  }

  @Post("roles")
  @ApiOperation({ summary: "역할 생성" })
  @Permissions("admin:manage")
  createRole(@Body() dto: CreateRoleDto, @Req() req: Request & { user: AuthUser }) {
    return this.adminRoles.createRole(dto, req.user, req.ip);
  }

  @Patch("roles/:id")
  @ApiOperation({ summary: "역할 수정 (이름·권한)" })
  @Permissions("admin:manage")
  updateRole(
    @Param("id") id: string,
    @Body() dto: UpdateRoleDto,
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.adminRoles.updateRole(BigInt(id), dto, req.user, req.ip);
  }

  @Delete("roles/:id")
  @ApiOperation({ summary: "역할 삭제 (사용 중이면 실패)" })
  @Permissions("admin:manage")
  deleteRole(@Param("id") id: string, @Req() req: Request & { user: AuthUser }) {
    return this.adminRoles.deleteRole(BigInt(id), req.user, req.ip);
  }

  // ── 어드민 계정 ───────────────────────────────────────

  @Get("admins")
  @ApiOperation({ summary: "어드민 계정 목록" })
  @Permissions("admin:manage")
  listAdmins() {
    return this.adminRoles.listAdmins();
  }

  @Post("admins")
  @ApiOperation({ summary: "어드민 계정 생성 (일반 유저에게 역할 부여)" })
  @Permissions("admin:manage")
  assignAdmin(@Body() dto: AssignAdminDto, @Req() req: Request & { user: AuthUser }) {
    return this.adminRoles.assignAdmin(dto, req.user, req.ip);
  }

  @Patch("users/:idx/role")
  @ApiOperation({ summary: "어드민 역할 변경" })
  @Permissions("admin:manage")
  updateAdminRole(
    @Param("idx") idx: string,
    @Body() dto: UpdateAdminRoleDto,
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.adminRoles.updateAdminRole(BigInt(idx), dto, req.user, req.ip);
  }

  @Delete("admins/:idx")
  @ApiOperation({ summary: "어드민 해제 (일반 유저로 복귀)" })
  @Permissions("admin:manage")
  removeAdmin(@Param("idx") idx: string, @Req() req: Request & { user: AuthUser }) {
    return this.adminRoles.removeAdmin(BigInt(idx), req.user, req.ip);
  }
}
