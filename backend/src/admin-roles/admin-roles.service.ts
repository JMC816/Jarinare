import { HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AppException } from "../common/errors/app.exception";
import { ErrorCode } from "../common/errors/error-code";
import { AuditService } from "../audit/audit.service";
import { RolePermissionsService } from "../role-permissions/role-permissions.service";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import type {
  AssignAdminDto,
  CreateRoleDto,
  UpdateAdminRoleDto,
  UpdateRoleDto,
} from "./dto/admin-roles.dto";

@Injectable()
export class AdminRolesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly rolePermissions: RolePermissionsService,
  ) {}

  // ── 역할 ──────────────────────────────────────────────

  async listRoles() {
    const roles = await this.prisma.adminRole.findMany({
      orderBy: { createdAt: "asc" },
    });
    return roles.map((r) => ({ ...r, id: r.id.toString() }));
  }

  async createRole(dto: CreateRoleDto, actor: AuthUser, ip: string | undefined) {
    const existing = await this.prisma.adminRole.findUnique({ where: { code: dto.code } });
    if (existing) {
      throw new AppException(ErrorCode.CONFLICT, `이미 존재하는 코드입니다: ${dto.code}`, HttpStatus.CONFLICT);
    }

    const role = await this.prisma.adminRole.create({
      data: { code: dto.code, name: dto.name, permissions: dto.permissions },
    });

    this.audit.log({
      actorIdx: actor.idx,
      action: "admin_role.create",
      targetType: "admin_role",
      targetId: role.id.toString(),
      after: { code: dto.code, name: dto.name, permissions: dto.permissions },
      ip,
    });

    this.rolePermissions.invalidate();
    return { ...role, id: role.id.toString() };
  }

  async updateRole(id: bigint, dto: UpdateRoleDto, actor: AuthUser, ip: string | undefined) {
    const role = await this.prisma.adminRole.findUnique({ where: { id } });
    if (!role) throw new AppException(ErrorCode.NOT_FOUND, "역할을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);

    const before = { name: role.name, permissions: role.permissions };
    const updated = await this.prisma.adminRole.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.permissions ? { permissions: dto.permissions } : {}),
      },
    });

    this.audit.log({
      actorIdx: actor.idx,
      action: "admin_role.update",
      targetType: "admin_role",
      targetId: id.toString(),
      before,
      after: { name: updated.name, permissions: updated.permissions },
      ip,
    });

    this.rolePermissions.invalidate();
    return { ...updated, id: updated.id.toString() };
  }

  async deleteRole(id: bigint, actor: AuthUser, ip: string | undefined) {
    const role = await this.prisma.adminRole.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });
    if (!role) throw new AppException(ErrorCode.NOT_FOUND, "역할을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
    if (role._count.users > 0) {
      throw new AppException(ErrorCode.CONFLICT, "해당 역할을 사용 중인 어드민이 있습니다.", HttpStatus.CONFLICT);
    }

    await this.prisma.adminRole.delete({ where: { id } });

    this.audit.log({
      actorIdx: actor.idx,
      action: "admin_role.delete",
      targetType: "admin_role",
      targetId: id.toString(),
      before: { code: role.code, name: role.name },
      ip,
    });

    this.rolePermissions.invalidate();
    return { success: true };
  }

  // ── 어드민 계정 ───────────────────────────────────────

  async listAdmins() {
    const users = await this.prisma.user.findMany({
      where: { adminRoleId: { not: null } },
      select: {
        idx: true,
        email: true,
        name: true,
        adminRole: { select: { id: true, code: true, name: true } },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return users.map((u) => ({
      idx: u.idx.toString(),
      email: u.email,
      name: u.name,
      role: u.adminRole ? { ...u.adminRole, id: u.adminRole.id.toString() } : null,
      createdAt: u.createdAt,
    }));
  }

  async assignAdmin(dto: AssignAdminDto, actor: AuthUser, ip: string | undefined) {
    const user = await this.prisma.user.findUnique({ where: { idx: BigInt(dto.userIdx) } });
    if (!user) throw new AppException(ErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다.", HttpStatus.NOT_FOUND);

    const role = await this.prisma.adminRole.findUnique({ where: { id: BigInt(dto.roleId) } });
    if (!role) throw new AppException(ErrorCode.NOT_FOUND, "역할을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);

    await this.prisma.user.update({
      where: { idx: BigInt(dto.userIdx) },
      data: { adminRoleId: BigInt(dto.roleId) },
    });

    this.audit.log({
      actorIdx: actor.idx,
      action: "admin.assign",
      targetType: "user",
      targetId: dto.userIdx.toString(),
      before: { adminRoleId: user.adminRoleId?.toString() ?? null },
      after: { adminRoleId: dto.roleId.toString(), roleCode: role.code },
      ip,
    });

    return { success: true };
  }

  async updateAdminRole(targetIdx: bigint, dto: UpdateAdminRoleDto, actor: AuthUser, ip: string | undefined) {
    const user = await this.prisma.user.findUnique({ where: { idx: targetIdx } });
    if (!user) throw new AppException(ErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
    if (!user.adminRoleId) throw new AppException(ErrorCode.NOT_FOUND, "어드민 계정이 아닙니다.", HttpStatus.NOT_FOUND);

    const role = await this.prisma.adminRole.findUnique({ where: { id: BigInt(dto.roleId) } });
    if (!role) throw new AppException(ErrorCode.NOT_FOUND, "역할을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);

    await this.prisma.user.update({
      where: { idx: targetIdx },
      data: { adminRoleId: BigInt(dto.roleId) },
    });

    this.audit.log({
      actorIdx: actor.idx,
      action: "admin.role_change",
      targetType: "user",
      targetId: targetIdx.toString(),
      before: { adminRoleId: user.adminRoleId.toString() },
      after: { adminRoleId: dto.roleId.toString(), roleCode: role.code },
      ip,
    });

    return { success: true };
  }

  async removeAdmin(targetIdx: bigint, actor: AuthUser, ip: string | undefined) {
    const user = await this.prisma.user.findUnique({ where: { idx: targetIdx } });
    if (!user) throw new AppException(ErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
    if (!user.adminRoleId) throw new AppException(ErrorCode.NOT_FOUND, "어드민 계정이 아닙니다.", HttpStatus.NOT_FOUND);

    await this.prisma.user.update({
      where: { idx: targetIdx },
      data: { adminRoleId: null },
    });

    this.audit.log({
      actorIdx: actor.idx,
      action: "admin.remove",
      targetType: "user",
      targetId: targetIdx.toString(),
      before: { adminRoleId: user.adminRoleId.toString() },
      after: { adminRoleId: null },
      ip,
    });

    return { success: true };
  }
}
