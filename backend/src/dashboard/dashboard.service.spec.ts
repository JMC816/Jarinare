import { BadRequestException } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";

const T = new Date("2026-11-17T10:00:00.000Z"); // 고정 기준 시각 (KST 19:00)
const H = 60 * 60 * 1000;
const M = 60 * 1000;

function makePrisma(opts: {
  orderCount?: number;
  canceledOrders?: { orderId: bigint }[];
  seatChangeGroups?: { status: string; _count: { id: number } }[];
  logSuccesses?: { jobName: string; endedAt: Date }[];
  jobSettings?: { name: string; lastSuccessAt: Date | null }[];
} = {}) {
  return {
    orderHistory: {
      aggregate: jest.fn().mockResolvedValue({
        _count: { id: opts.orderCount ?? 0 },
        _sum: { finalPrice: null },
      }),
      groupBy: jest.fn().mockResolvedValue([]),
      findMany: jest.fn().mockResolvedValue([]),
    },
    reservation: {
      findMany: jest.fn().mockResolvedValue(opts.canceledOrders ?? []),
    },
    user: { count: jest.fn().mockResolvedValue(0) },
    seatChangeRequest: {
      groupBy: jest.fn().mockResolvedValue(opts.seatChangeGroups ?? []),
    },
    report: { count: jest.fn().mockResolvedValue(0) },
    schedulerRunLog: {
      count: jest.fn().mockResolvedValue(0),
      findMany: jest.fn().mockResolvedValue(opts.logSuccesses ?? []),
    },
    schedulerJobSetting: {
      findMany: jest.fn().mockResolvedValue(opts.jobSettings ?? []),
    },
  };
}

function newSvc(p = makePrisma()) {
  return new DashboardService(p as never, { list: jest.fn().mockResolvedValue([]) } as never);
}

// staleJobs 테스트에서 재사용하는 "최근 성공" 기본값
const allLogsRecent = [
  { jobName: "station-sync",        endedAt: new Date(T.getTime() - 1 * H) },
  { jobName: "train-time-sync",     endedAt: new Date(T.getTime() - 1 * H) },
  { jobName: "notification-rotate", endedAt: new Date(T.getTime() - 1 * H) },
  { jobName: "notification-drop",   endedAt: new Date(T.getTime() - 1 * H) },
];
const allSettingsRecent = [
  { name: "seat-change-expire", lastSuccessAt: new Date(T.getTime() - 1 * M) },
  { name: "seat-hold-expire",   lastSuccessAt: new Date(T.getTime() - 1 * M) },
];

// ─────────────────────────────────────────────
// 취소율
// ─────────────────────────────────────────────
describe("DashboardService — 취소율", () => {
  it("10건 중 2건 취소 → cancelRate 20.0", async () => {
    const service = newSvc(makePrisma({
      orderCount: 10,
      canceledOrders: [{ orderId: 1n }, { orderId: 2n }],
    }));
    const res = await service.getSummary("20261101", "20261130");
    expect(res.reservations.cancelRate).toBe(20.0);
  });

  it("예매 0건 → cancelRate 0 (0 나누기 방지)", async () => {
    const service = newSvc(makePrisma({ orderCount: 0, canceledOrders: [] }));
    const res = await service.getSummary("20261101", "20261130");
    expect(res.reservations.cancelRate).toBe(0);
  });

  it("3건 중 1건 취소 → cancelRate 33.3 (소수 1자리 반올림)", async () => {
    const service = newSvc(makePrisma({
      orderCount: 3,
      canceledOrders: [{ orderId: 1n }],
    }));
    const res = await service.getSummary("20261101", "20261130");
    expect(res.reservations.cancelRate).toBe(33.3);
  });
});

// ─────────────────────────────────────────────
// 수락률
// ─────────────────────────────────────────────
describe("DashboardService — 수락률", () => {
  it("ACCEPTED 3, REJECTED 1 → acceptRate 75.0", async () => {
    const service = newSvc(makePrisma({
      seatChangeGroups: [
        { status: "ACCEPTED", _count: { id: 3 } },
        { status: "REJECTED", _count: { id: 1 } },
      ],
    }));
    const res = await service.getSummary("20261101", "20261130");
    expect(res.seatChanges.acceptRate).toBe(75.0);
  });

  it("처리 완료 건 없음 → acceptRate 0 (0 나누기 방지)", async () => {
    const service = newSvc(makePrisma({ seatChangeGroups: [] }));
    const res = await service.getSummary("20261101", "20261130");
    expect(res.seatChanges.acceptRate).toBe(0);
  });

  it("ACCEPTED 만 5건 → acceptRate 100.0", async () => {
    const service = newSvc(makePrisma({
      seatChangeGroups: [{ status: "ACCEPTED", _count: { id: 5 } }],
    }));
    const res = await service.getSummary("20261101", "20261130");
    expect(res.seatChanges.acceptRate).toBe(100.0);
  });
});

// ─────────────────────────────────────────────
// staleJobs
// ─────────────────────────────────────────────
describe("DashboardService — staleJobs", () => {
  beforeEach(() => jest.useFakeTimers().setSystemTime(T));
  afterEach(() => jest.useRealTimers());

  it("모든 job 최근 성공 → staleJobs 빈 배열", async () => {
    const service = newSvc(makePrisma({ logSuccesses: allLogsRecent, jobSettings: allSettingsRecent }));
    const res = await service.getSummary("20261101", "20261117");
    expect(res.scheduler.staleJobs).toEqual([]);
  });

  it("station-sync 30시간 전 성공 (임계값 26h) → stale, 나머지 정상", async () => {
    const service = newSvc(makePrisma({
      logSuccesses: [
        { jobName: "station-sync",        endedAt: new Date(T.getTime() - 30 * H) },
        { jobName: "train-time-sync",     endedAt: new Date(T.getTime() -  1 * H) },
        { jobName: "notification-rotate", endedAt: new Date(T.getTime() -  1 * H) },
        { jobName: "notification-drop",   endedAt: new Date(T.getTime() -  1 * H) },
      ],
      jobSettings: allSettingsRecent,
    }));
    const res = await service.getSummary("20261101", "20261117");
    expect(res.scheduler.staleJobs).toContain("station-sync");
    expect(res.scheduler.staleJobs).not.toContain("train-time-sync");
  });

  it("station-sync 로그 없음 → stale", async () => {
    const service = newSvc(makePrisma({
      logSuccesses: [
        { jobName: "train-time-sync",     endedAt: new Date(T.getTime() - 1 * H) },
        { jobName: "notification-rotate", endedAt: new Date(T.getTime() - 1 * H) },
        { jobName: "notification-drop",   endedAt: new Date(T.getTime() - 1 * H) },
      ],
      jobSettings: allSettingsRecent,
    }));
    const res = await service.getSummary("20261101", "20261117");
    expect(res.scheduler.staleJobs).toContain("station-sync");
  });

  it("seat-hold-expire 15분 전 성공 (임계값 10분) → stale, seat-change-expire 는 정상", async () => {
    const service = newSvc(makePrisma({
      logSuccesses: allLogsRecent,
      jobSettings: [
        { name: "seat-change-expire", lastSuccessAt: new Date(T.getTime() -  1 * M) },
        { name: "seat-hold-expire",   lastSuccessAt: new Date(T.getTime() - 15 * M) },
      ],
    }));
    const res = await service.getSummary("20261101", "20261117");
    expect(res.scheduler.staleJobs).toContain("seat-hold-expire");
    expect(res.scheduler.staleJobs).not.toContain("seat-change-expire");
  });

  it("seat-hold-expire 설정 행 없음 → stale", async () => {
    const service = newSvc(makePrisma({
      logSuccesses: allLogsRecent,
      jobSettings: [
        { name: "seat-change-expire", lastSuccessAt: new Date(T.getTime() - 1 * M) },
        // seat-hold-expire 행 없음
      ],
    }));
    const res = await service.getSummary("20261101", "20261117");
    expect(res.scheduler.staleJobs).toContain("seat-hold-expire");
    expect(res.scheduler.staleJobs).not.toContain("seat-change-expire");
  });
});

// ─────────────────────────────────────────────
// KST 기간 경계
// ─────────────────────────────────────────────
describe("DashboardService — KST 기간 경계", () => {
  it("from=20261101 → Prisma start UTC 가 2026-10-31T15:00:00Z", async () => {
    const p = makePrisma();
    await newSvc(p).getSummary("20261101", "20261101");
    const arg = (p.orderHistory.aggregate as jest.Mock).mock.calls[0][0] as {
      where: { createdAt: { gte: Date; lte: Date } };
    };
    expect(arg.where.createdAt.gte.toISOString()).toBe("2026-10-31T15:00:00.000Z");
    expect(arg.where.createdAt.lte.toISOString()).toBe("2026-11-01T14:59:59.000Z");
  });

  it("from > to → BadRequestException", async () => {
    await expect(newSvc().getSummary("20261130", "20261101")).rejects.toThrow(BadRequestException);
  });

  it("summary 94일 → BadRequestException (최대 92일)", async () => {
    // 20260101 ~ 20260404 = 94일
    await expect(newSvc().getSummary("20260101", "20260404")).rejects.toThrow(BadRequestException);
  });

  it("hourly 33일 → BadRequestException (최대 31일)", async () => {
    // 20261001 ~ 20261102 = 33일
    await expect(newSvc().getHourlyReservations("20261001", "20261102")).rejects.toThrow(BadRequestException);
  });
});
