import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PermissionsGuard } from "./permissions.guard";
import type { AuthUser } from "../interfaces/auth-user.interface";
import type { RolePermissionsService } from "../../role-permissions/role-permissions.service";

const TEST_PERMISSIONS: Record<string, string[]> = {
  user: [],
  cs: ["dashboard:view", "user:view", "report:view", "reservation:view", "membership:view", "card:view", "scheduler:view"],
  marketer: ["dashboard:view", "membership:view", "membership:manage", "card:view", "card:manage", "board:create", "notification:send"],
  operator: ["dashboard:view", "user:view", "user:suspend", "report:view", "report:resolve", "board:delete", "board:create", "scheduler:view", "scheduler:run", "reservation:view"],
  super_admin: ["user:view", "user:suspend", "user:delete", "report:view", "report:resolve", "report:delete", "board:delete", "board:create", "membership:view", "membership:manage", "card:view", "card:manage", "scheduler:view", "scheduler:run", "dashboard:view", "notification:send", "reservation:view", "admin:manage"],
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

  it("super_admin은 모든 권한에 통과한다", async () => {
    reflector.getAllAndOverride.mockReturnValue(["admin:manage"]);
    const user: AuthUser = { idx: 1, email: "a@a.com", role: "super_admin" };
    await expect(guard.canActivate(mockContext(user))).resolves.toBe(true);
  });

  it("operator는 scheduler:run에 통과한다", async () => {
    reflector.getAllAndOverride.mockReturnValue(["scheduler:run"]);
    const user: AuthUser = { idx: 2, email: "b@a.com", role: "operator" };
    await expect(guard.canActivate(mockContext(user))).resolves.toBe(true);
  });

  it("operator는 admin:manage에서 403을 던진다", async () => {
    reflector.getAllAndOverride.mockReturnValue(["admin:manage"]);
    const user: AuthUser = { idx: 2, email: "b@a.com", role: "operator" };
    await expect(guard.canActivate(mockContext(user))).rejects.toThrow(ForbiddenException);
  });

  it("cs는 user:view에 통과한다", async () => {
    reflector.getAllAndOverride.mockReturnValue(["user:view"]);
    const user: AuthUser = { idx: 3, email: "c@a.com", role: "cs" };
    await expect(guard.canActivate(mockContext(user))).resolves.toBe(true);
  });

  it("cs는 user:suspend에서 403을 던진다", async () => {
    reflector.getAllAndOverride.mockReturnValue(["user:suspend"]);
    const user: AuthUser = { idx: 3, email: "c@a.com", role: "cs" };
    await expect(guard.canActivate(mockContext(user))).rejects.toThrow(ForbiddenException);
  });

  it("marketer는 membership:manage에 통과한다", async () => {
    reflector.getAllAndOverride.mockReturnValue(["membership:manage"]);
    const user: AuthUser = { idx: 4, email: "d@a.com", role: "marketer" };
    await expect(guard.canActivate(mockContext(user))).resolves.toBe(true);
  });

  it("marketer는 scheduler:run에서 403을 던진다", async () => {
    reflector.getAllAndOverride.mockReturnValue(["scheduler:run"]);
    const user: AuthUser = { idx: 4, email: "d@a.com", role: "marketer" };
    await expect(guard.canActivate(mockContext(user))).rejects.toThrow(ForbiddenException);
  });

  it("user는 모든 권한에서 403을 던진다", async () => {
    reflector.getAllAndOverride.mockReturnValue(["user:view"]);
    const user: AuthUser = { idx: 5, email: "e@a.com", role: "user" };
    await expect(guard.canActivate(mockContext(user))).rejects.toThrow(ForbiddenException);
  });

  it("user가 undefined면 403을 던진다", async () => {
    reflector.getAllAndOverride.mockReturnValue(["user:view"]);
    await expect(guard.canActivate(mockContext(undefined))).rejects.toThrow(ForbiddenException);
  });

  it("여러 권한을 모두 충족해야 통과한다", async () => {
    const cs: AuthUser = { idx: 3, email: "c@a.com", role: "cs" };

    reflector.getAllAndOverride.mockReturnValue(["user:view", "report:view"]);
    await expect(guard.canActivate(mockContext(cs))).resolves.toBe(true);

    reflector.getAllAndOverride.mockReturnValue(["user:view", "admin:manage"]);
    await expect(guard.canActivate(mockContext(cs))).rejects.toThrow(ForbiddenException);
  });
});
