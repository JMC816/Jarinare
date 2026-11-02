import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PermissionsGuard } from "./permissions.guard";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";
import type { AuthUser } from "../interfaces/auth-user.interface";

function mockContext(user: AuthUser | undefined): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe("PermissionsGuard", () => {
  let guard: PermissionsGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as unknown as jest.Mocked<Reflector>;
    guard = new PermissionsGuard(reflector);
  });

  it("요구 권한이 없으면 통과한다", () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const result = guard.canActivate(mockContext(undefined));
    expect(result).toBe(true);
  });

  it("super_admin은 모든 권한에 통과한다", () => {
    reflector.getAllAndOverride.mockReturnValue(["admin:manage"]);
    const user: AuthUser = { idx: 1, email: "a@a.com", role: "super_admin" };
    expect(guard.canActivate(mockContext(user))).toBe(true);
  });

  it("operator는 scheduler:run에 통과한다", () => {
    reflector.getAllAndOverride.mockReturnValue(["scheduler:run"]);
    const user: AuthUser = { idx: 2, email: "b@a.com", role: "operator" };
    expect(guard.canActivate(mockContext(user))).toBe(true);
  });

  it("operator는 admin:manage에서 403을 던진다", () => {
    reflector.getAllAndOverride.mockReturnValue(["admin:manage"]);
    const user: AuthUser = { idx: 2, email: "b@a.com", role: "operator" };
    expect(() => guard.canActivate(mockContext(user))).toThrow(ForbiddenException);
  });

  it("cs는 user:view에 통과한다", () => {
    reflector.getAllAndOverride.mockReturnValue(["user:view"]);
    const user: AuthUser = { idx: 3, email: "c@a.com", role: "cs" };
    expect(guard.canActivate(mockContext(user))).toBe(true);
  });

  it("cs는 user:suspend에서 403을 던진다", () => {
    reflector.getAllAndOverride.mockReturnValue(["user:suspend"]);
    const user: AuthUser = { idx: 3, email: "c@a.com", role: "cs" };
    expect(() => guard.canActivate(mockContext(user))).toThrow(ForbiddenException);
  });

  it("marketer는 membership:manage에 통과한다", () => {
    reflector.getAllAndOverride.mockReturnValue(["membership:manage"]);
    const user: AuthUser = { idx: 4, email: "d@a.com", role: "marketer" };
    expect(guard.canActivate(mockContext(user))).toBe(true);
  });

  it("marketer는 scheduler:run에서 403을 던진다", () => {
    reflector.getAllAndOverride.mockReturnValue(["scheduler:run"]);
    const user: AuthUser = { idx: 4, email: "d@a.com", role: "marketer" };
    expect(() => guard.canActivate(mockContext(user))).toThrow(ForbiddenException);
  });

  it("user는 모든 권한에서 403을 던진다", () => {
    reflector.getAllAndOverride.mockReturnValue(["user:view"]);
    const user: AuthUser = { idx: 5, email: "e@a.com", role: "user" };
    expect(() => guard.canActivate(mockContext(user))).toThrow(ForbiddenException);
  });

  it("user가 undefined면 403을 던진다", () => {
    reflector.getAllAndOverride.mockReturnValue(["user:view"]);
    expect(() => guard.canActivate(mockContext(undefined))).toThrow(ForbiddenException);
  });

  it("여러 권한을 모두 충족해야 통과한다", () => {
    reflector.getAllAndOverride.mockReturnValue(["user:view", "report:view"]);
    const cs: AuthUser = { idx: 3, email: "c@a.com", role: "cs" };
    expect(guard.canActivate(mockContext(cs))).toBe(true);

    reflector.getAllAndOverride.mockReturnValue(["user:view", "admin:manage"]);
    expect(() => guard.canActivate(mockContext(cs))).toThrow(ForbiddenException);
  });
});
