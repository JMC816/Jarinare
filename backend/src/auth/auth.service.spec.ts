import { HttpStatus, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AppException } from "../common/errors/app.exception";
import { ErrorCode } from "../common/errors/error-code";
import * as checkSuspensionModule from "./helpers/check-suspension";

jest.mock("./helpers/check-suspension");

const mockCheckSuspension = checkSuspensionModule.checkSuspension as jest.MockedFunction<
  typeof checkSuspensionModule.checkSuspension
>;

function makeMockPrisma(user: object | null) {
  return {
    user: {
      findUnique: jest.fn().mockResolvedValue(user),
      update: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({}),
    },
    adminRole: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
  };
}

const future = new Date(Date.now() + 1000 * 60 * 60);

const baseUser = {
  idx: 1n,
  email: "test@test.com",
  role: "user",
  adminRoleId: null,
  status: "suspended",
  suspendedUntil: future,
  refreshToken: "valid-token",
  refreshTokenExpiresAt: future,
  password: null,
  refreshTokenExpiresAt2: null,
};

describe("AuthService.rotateRefreshToken — 정지 차단", () => {
  let service: AuthService;

  beforeEach(() => {
    const prisma = makeMockPrisma(baseUser);
    const jwtService = { sign: jest.fn().mockReturnValue("access-token") } as any;
    const config = { refreshTokenExpiresDays: 30 } as any;
    service = new AuthService(prisma as any, jwtService, config);
    mockCheckSuspension.mockReset();
  });

  it("정지 중이면 403 ACCOUNT_SUSPENDED를 던진다", async () => {
    mockCheckSuspension.mockRejectedValue(
      new AppException(ErrorCode.ACCOUNT_SUSPENDED, "정지된 계정입니다.", HttpStatus.FORBIDDEN),
    );
    await expect(service.rotateRefreshToken("valid-token")).rejects.toMatchObject({
      code: ErrorCode.ACCOUNT_SUSPENDED,
      status: HttpStatus.FORBIDDEN,
    });
    expect(mockCheckSuspension).toHaveBeenCalledTimes(1);
  });

  it("종료일이 지났으면 checkSuspension이 통과하고 토큰을 반환한다", async () => {
    mockCheckSuspension.mockResolvedValue(undefined);
    const result = await service.rotateRefreshToken("valid-token");
    expect(result).toHaveProperty("accessToken");
    expect(result).toHaveProperty("refreshToken");
    expect(mockCheckSuspension).toHaveBeenCalledTimes(1);
  });
});
