import { HttpStatus } from "@nestjs/common";
import { AppException } from "../../common/errors/app.exception";
import { ErrorCode } from "../../common/errors/error-code";
import { PrismaService } from "../../prisma/prisma.service";

export async function checkSuspension(
  user: { idx: bigint; status: string; suspendedUntil: Date | null },
  prisma: PrismaService,
): Promise<void> {
  if (user.status !== "suspended") return;

  if (user.suspendedUntil && user.suspendedUntil <= new Date()) {
    await prisma.user.update({
      where: { idx: user.idx },
      data: { status: "active", suspendedUntil: null, suspendReason: null },
    });
    return;
  }

  throw new AppException(
    ErrorCode.ACCOUNT_SUSPENDED,
    "정지된 계정입니다. 고객센터에 문의해 주세요.",
    HttpStatus.FORBIDDEN,
  );
}
