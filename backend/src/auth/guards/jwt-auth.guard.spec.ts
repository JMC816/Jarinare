import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { HttpStatus } from "@nestjs/common";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { AppException } from "../../common/errors/app.exception";
import { ErrorCode } from "../../common/errors/error-code";
import * as checkSuspensionModule from "../helpers/check-suspension";

jest.mock("../helpers/check-suspension");

const mockCheckSuspension = checkSuspensionModule.checkSuspension as jest.MockedFunction<
  typeof checkSuspensionModule.checkSuspension
>;

function mockContext(token: string | undefined): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({
        headers: token ? { authorization: `Bearer ${token}` } : {},
        query: {},
        user: undefined,
      }),
    }),
  } as unknown as ExecutionContext;
}

describe("JwtAuthGuard — 정지 차단", () => {
  let guard: JwtAuthGuard;
  let mockJwtService: jest.Mocked<{ verifyAsync: jest.Mock }>;
  let mockReflector: jest.Mocked<{ getAllAndOverride: jest.Mock }>;
  let mockPrisma: jest.Mocked<{ user: { findUnique: jest.Mock } }>;

  const future = new Date(Date.now() + 1000 * 60 * 60);

  beforeEach(() => {
    mockJwtService = { verifyAsync: jest.fn().mockResolvedValue({ sub: 1, email: "test@test.com", role: "user" }) } as any;
    mockReflector = { getAllAndOverride: jest.fn().mockReturnValue(false) } as any;
    mockPrisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ status: "suspended", suspendedUntil: future }),
      },
    } as any;
    guard = new JwtAuthGuard(mockJwtService as any, mockReflector as any, mockPrisma as any);
    mockCheckSuspension.mockReset();
  });

  it("정지 중이면 403 ACCOUNT_SUSPENDED를 던진다", async () => {
    mockCheckSuspension.mockRejectedValue(
      new AppException(ErrorCode.ACCOUNT_SUSPENDED, "정지된 계정입니다.", HttpStatus.FORBIDDEN),
    );
    await expect(guard.canActivate(mockContext("valid-token"))).rejects.toMatchObject({
      code: ErrorCode.ACCOUNT_SUSPENDED,
      status: HttpStatus.FORBIDDEN,
    });
    expect(mockCheckSuspension).toHaveBeenCalledTimes(1);
  });

  it("종료일이 지났으면 통과한다", async () => {
    mockCheckSuspension.mockResolvedValue(undefined);
    await expect(guard.canActivate(mockContext("valid-token"))).resolves.toBe(true);
    expect(mockCheckSuspension).toHaveBeenCalledTimes(1);
  });
});
