import { HttpStatus } from "@nestjs/common";
import { OAuthController } from "./oauth.controller";
import { AppException } from "../common/errors/app.exception";
import { ErrorCode } from "../common/errors/error-code";
import * as checkSuspensionModule from "./helpers/check-suspension";
import * as bcrypt from "bcrypt";

jest.mock("./helpers/check-suspension");
jest.mock("bcrypt");

const mockCheckSuspension = checkSuspensionModule.checkSuspension as jest.MockedFunction<
  typeof checkSuspensionModule.checkSuspension
>;
const mockBcryptCompare = bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>;

const future = new Date(Date.now() + 1000 * 60 * 60);

const baseUser = {
  idx: 1n,
  email: "test@test.com",
  password: "hashed",
  role: "user",
  adminRoleId: null,
  status: "suspended",
  suspendedUntil: future,
};

function makeController() {
  const usersService = {
    findByEmail: jest.fn().mockResolvedValue(baseUser),
    toProfilePublic: jest.fn().mockResolvedValue({ email: "test@test.com" }),
  } as any;

  const authService = {
    generateTokenPair: jest.fn().mockResolvedValue({ accessToken: "access", refreshToken: "refresh" }),
  } as any;

  const config = { refreshTokenExpiresDays: 30 } as any;
  const prisma = {} as any;

  const controller = new OAuthController(usersService, authService, config, prisma);
  return { controller, usersService, authService };
}

const mockRes = {
  cookie: jest.fn(),
  clearCookie: jest.fn(),
} as any;

describe("OAuthController.login — 정지 차단", () => {
  beforeEach(() => {
    mockBcryptCompare.mockResolvedValue(true as never);
    mockCheckSuspension.mockReset();
  });

  it("정지 중이면 403 ACCOUNT_SUSPENDED를 던진다", async () => {
    const { controller } = makeController();
    mockCheckSuspension.mockRejectedValue(
      new AppException(ErrorCode.ACCOUNT_SUSPENDED, "정지된 계정입니다.", HttpStatus.FORBIDDEN),
    );
    await expect(
      controller.login({ email: "test@test.com", password: "pass" }, mockRes),
    ).rejects.toMatchObject({
      code: ErrorCode.ACCOUNT_SUSPENDED,
      status: HttpStatus.FORBIDDEN,
    });
    expect(mockCheckSuspension).toHaveBeenCalledTimes(1);
  });

  it("종료일이 지났으면 통과하고 토큰을 반환한다", async () => {
    const { controller } = makeController();
    mockCheckSuspension.mockResolvedValue(undefined);
    const result = await controller.login({ email: "test@test.com", password: "pass" }, mockRes);
    expect(result).toHaveProperty("accessToken");
    expect(mockCheckSuspension).toHaveBeenCalledTimes(1);
  });
});
