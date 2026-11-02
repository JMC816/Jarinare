import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";
import { hasPermission, type Permission } from "../permission.types";
import type { AuthUser } from "../interfaces/auth-user.interface";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required || required.length === 0) return true;

    const user = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthUser }>().user;

    if (!user) throw new ForbiddenException("접근 권한이 없습니다.");

    const allowed = required.every((p) => hasPermission(user.role, p));
    if (!allowed) throw new ForbiddenException("접근 권한이 없습니다.");
    return true;
  }
}
