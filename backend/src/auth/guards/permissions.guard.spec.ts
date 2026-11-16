import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PermissionsGuard } from "./permissions.guard";
import type { AuthUser } from "../interfaces/auth-user.interface";
import type { RolePermissionsService } from "../../role-permissions/role-permissions.service";

const TEST_PERMISSIONS: Record<string, string[]> = {
  user: [],
  CS: ["dashboard:read", "user:read", "report:read", "report:resolve", "reservation:read"],
  MARKETER: ["dashboard:read", "membership:manage", "discount:manage", "board:manage", "notification:send"],
  OPERATOR: ["dashboard:read", "user:read", "user:suspend", "report:read", "report:resolve", "board:manage", "reservation:read", "reservation:manage", "scheduler:read", "scheduler:run"],
  SUPER_ADMIN: ["dashboard:read", "user:read", "user:suspend", "point:adjust", "admin:manage", "report:read", "report:resolve", "membership:manage", "discount:manage", "board:manage", "reservation:read", "reservation:manage", "notification:send", "scheduler:read", "scheduler:run"],
};

function mockContext(user: AuthUser | undefined): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

function mockRolePermissions(): jest.Mocked<RolePermissionsService> {
  return {
    getPermissions: jest.fn(async (role: string) => TEST_PERMISSIONS[role] ?? []),
    hasPermission: jest.fn(),
    invalidate: jest.fn(),
  } as unknown as jest.Mocked<RolePermissionsService>;
}

describe("PermissionsGuard", () => {
  let guard: PermissionsGuard;
  let reflector: jest.Mocked<Reflector>;
  let rolePermissions: jest.Mocked<RolePermissionsService>;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as unknown as jest.Mocked<Reflector>;
    rolePermissions = mockRolePermissions();
    guard = new PermissionsGuard(reflector, rolePermissions);
  });

  it("요구 권한이 없으면 통과한다", async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    await expect(guard.canActivate(mockContext(undefined))).resolves.toBe(true);
  });

  it("SUPER_ADMIN은 모든 권한에 통과한다", async () => {
    reflector.getAllAndOverride.mockReturnValue(["admin:manage"]);
    const user: AuthUser = { idx: 1, email: "a@a.com", role: "super_admin", adminRoleCode: "SUPER_ADMIN" };
    await expect(guard.canActivate(mockContext(user))).resolves.toBe(true);
  });

  it("OPERATOR는 scheduler:run에 통과한다", async () => {
    reflector.getAllAndOverride.mockReturnValue(["scheduler:run"]);
    const user: AuthUser = { idx: 2, email: "b@a.com", role: "operator", adminRoleCode: "OPERATOR" };
    await expect(guard.canActivate(mockContext(user))).resolves.toBe(true);
  });

  it("OPERATOR는 admin:manage에서 403을 던진다", async () => {
    reflector.getAllAndOverride.mockReturnValue(["admin:manage"]);
    const user: AuthUser = { idx: 2, email: "b@a.com", role: "operator", adminRoleCode: "OPERATOR" };
    await expect(guard.canActivate(mockContext(user))).rejects.toThrow(ForbiddenException);
  });

  it("CS는 user:read에 통과한다", async () => {
    reflector.getAllAndOverride.mockReturnValue(["user:read"]);
    const user: AuthUser = { idx: 3, email: "c@a.com", role: "cs", adminRoleCode: "CS" };
    await expect(guard.canActivate(mockContext(user))).resolves.toBe(true);
  });

  it("CS는 user:suspend에서 403을 던진다", async () => {
    reflector.getAllAndOverride.mockReturnValue(["user:suspend"]);
    const user: AuthUser = { idx: 3, email: "c@a.com", role: "cs", adminRoleCode: "CS" };
    await expect(guard.canActivate(mockContext(user))).rejects.toThrow(ForbiddenException);
  });

  it("MARKETER는 membership:manage에 통과한다", async () => {
    reflector.getAllAndOverride.mockReturnValue(["membership:manage"]);
    const user: AuthUser = { idx: 4, email: "d@a.com", role: "marketer", adminRoleCode: "MARKETER" };
    await expect(guard.canActivate(mockContext(user))).resolves.toBe(true);
  });

  it("MARKETER는 scheduler:run에서 403을 던진다", async () => {
    reflector.getAllAndOverride.mockReturnValue(["scheduler:run"]);
    const user: AuthUser = { idx: 4, email: "d@a.com", role: "marketer", adminRoleCode: "MARKETER" };
    await expect(guard.canActivate(mockContext(user))).rejects.toThrow(ForbiddenException);
  });

  it("user는 모든 권한에서 403을 던진다", async () => {
    reflector.getAllAndOverride.mockReturnValue(["user:read"]);
    const user: AuthUser = { idx: 5, email: "e@a.com", role: "user" };
    await expect(guard.canActivate(mockContext(user))).rejects.toThrow(ForbiddenException);
  });

  it("user가 undefined면 403을 던진다", async () => {
    reflector.getAllAndOverride.mockReturnValue(["user:read"]);
    await expect(guard.canActivate(mockContext(undefined))).rejects.toThrow(ForbiddenException);
  });

  it("여러 권한을 모두 충족해야 통과한다", async () => {
    const cs: AuthUser = { idx: 3, email: "c@a.com", role: "cs", adminRoleCode: "CS" };

    reflector.getAllAndOverride.mockReturnValue(["user:read", "report:read"]);
    await expect(guard.canActivate(mockContext(cs))).resolves.toBe(true);

    reflector.getAllAndOverride.mockReturnValue(["user:read", "admin:manage"]);
    await expect(guard.canActivate(mockContext(cs))).rejects.toThrow(ForbiddenException);
  });
});
