import { HttpStatus } from "@nestjs/common";
import { checkSuspension } from "./check-suspension";
import { AppException } from "../../common/errors/app.exception";
import { ErrorCode } from "../../common/errors/error-code";
import type { PrismaService } from "../../prisma/prisma.service";

function mockPrisma(): jest.Mocked<Pick<PrismaService, "user">> {
  return {
    user: {
      update: jest.fn().mockResolvedValue({}),
    } as unknown as jest.Mocked<PrismaService["user"]>,
  };
}

describe("checkSuspension", () => {
  it("status가 suspended가 아니면 통과한다", async () => {
    const prisma = mockPrisma();
    await expect(
      checkSuspension(
        { idx: 1n, status: "active", suspendedUntil: null },
        prisma as unknown as PrismaService,
      ),
    ).resolves.toBeUndefined();
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("정지 중이고 suspendedUntil이 미래이면 403 ACCOUNT_SUSPENDED를 던진다", async () => {
    const prisma = mockPrisma();
    const future = new Date(Date.now() + 1000 * 60 * 60);
    await expect(
      checkSuspension(
        { idx: 1n, status: "suspended", suspendedUntil: future },
        prisma as unknown as PrismaService,
      ),
    ).rejects.toMatchObject({
      code: ErrorCode.ACCOUNT_SUSPENDED,
      status: HttpStatus.FORBIDDEN,
    });
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("suspendedUntil이 null이면 403 ACCOUNT_SUSPENDED를 던진다", async () => {
    const prisma = mockPrisma();
    await expect(
      checkSuspension(
        { idx: 1n, status: "suspended", suspendedUntil: null },
        prisma as unknown as PrismaService,
      ),
    ).rejects.toMatchObject({
      code: ErrorCode.ACCOUNT_SUSPENDED,
      status: HttpStatus.FORBIDDEN,
    });
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("정지 만료(suspendedUntil이 과거)이면 active로 복원 후 통과한다", async () => {
    const prisma = mockPrisma();
    const past = new Date(Date.now() - 1000);
    await expect(
      checkSuspension(
        { idx: 2n, status: "suspended", suspendedUntil: past },
        prisma as unknown as PrismaService,
      ),
    ).resolves.toBeUndefined();
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { idx: 2n },
      data: { status: "active", suspendedUntil: null, suspendReason: null },
    });
  });
});
