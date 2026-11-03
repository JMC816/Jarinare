import { NotFoundException } from "@nestjs/common";
import { SchedulerRunLogService } from "./scheduler-run-log.service";

const makeRow = (overrides: Partial<{
  runId: bigint; jobName: string; status: string;
  startYmd: string; endYmd: string;
  startedAt: Date; endedAt: Date | null;
  errorMessage: string | null; metadata: unknown;
  triggeredBy: bigint | null; params: unknown;
}> = {}) => ({
  runId: BigInt(1),
  jobName: "station-sync",
  status: "SUCCESS",
  startYmd: "20260101",
  endYmd: "20260101",
  startedAt: new Date("2026-01-01"),
  endedAt: new Date("2026-01-01"),
  errorMessage: null,
  metadata: null,
  triggeredBy: null,
  params: null,
  ...overrides,
});

const mockPrisma = () => ({
  schedulerRunLog: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    groupBy: jest.fn().mockResolvedValue([]),
  },
});

describe("SchedulerRunLogService", () => {
  let service: SchedulerRunLogService;
  let prisma: ReturnType<typeof mockPrisma>;

  beforeEach(() => {
    prisma = mockPrisma();
    service = new SchedulerRunLogService(prisma as never);
  });

  // ──────────────── list() ────────────────

  describe("list()", () => {
    it("triggeredBy 없이 조회하면 where에 포함하지 않는다", async () => {
      prisma.schedulerRunLog.findMany.mockResolvedValueOnce([]);
      await service.list({ limit: 10 });
      const call = prisma.schedulerRunLog.findMany.mock.calls[0][0];
      expect(call.where).not.toHaveProperty("triggeredBy");
    });

    it("triggeredBy 로 필터하면 where에 bigint로 전달된다", async () => {
      prisma.schedulerRunLog.findMany.mockResolvedValueOnce([]);
      await service.list({ limit: 10, triggeredBy: BigInt(7) });
      const call = prisma.schedulerRunLog.findMany.mock.calls[0][0];
      expect(call.where).toMatchObject({ triggeredBy: BigInt(7) });
    });

    it("반환 row의 triggeredBy를 문자열로 직렬화한다", async () => {
      prisma.schedulerRunLog.findMany.mockResolvedValueOnce([
        makeRow({ triggeredBy: BigInt(42) }),
      ]);
      const items = await service.list({ limit: 10 });
      expect(items[0].triggeredBy).toBe("42");
    });

    it("triggeredBy가 null이면 null로 반환한다", async () => {
      prisma.schedulerRunLog.findMany.mockResolvedValueOnce([makeRow()]);
      const items = await service.list({ limit: 10 });
      expect(items[0].triggeredBy).toBeNull();
    });

    it("params를 그대로 반환한다", async () => {
      prisma.schedulerRunLog.findMany.mockResolvedValueOnce([
        makeRow({ params: { days: 3 } }),
      ]);
      const items = await service.list({ limit: 10 });
      expect(items[0].params).toEqual({ days: 3 });
    });
  });

  // ──────────────── get() ────────────────

  describe("get()", () => {
    it("존재하는 runId의 triggeredBy와 params를 반환한다", async () => {
      prisma.schedulerRunLog.findUnique.mockResolvedValueOnce(
        makeRow({ triggeredBy: BigInt(5), params: { force: true } }),
      );
      const item = await service.get(BigInt(1));
      expect(item.triggeredBy).toBe("5");
      expect(item.params).toEqual({ force: true });
    });

    it("존재하지 않는 runId는 NotFoundException을 던진다", async () => {
      prisma.schedulerRunLog.findUnique.mockResolvedValueOnce(null);
      await expect(service.get(BigInt(999))).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  // ──────────────── summary() ────────────────

  describe("summary()", () => {
    it("상태별 건수를 Record로 반환한다", async () => {
      prisma.schedulerRunLog.groupBy.mockResolvedValueOnce([
        { status: "SUCCESS", _count: { _all: 10 } },
        { status: "FAILED", _count: { _all: 2 } },
      ]);
      const result = await service.summary();
      expect(result).toEqual({ SUCCESS: 10, FAILED: 2 });
    });
  });
});
