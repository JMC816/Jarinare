import { Logger, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AuditService } from "./audit.service";
import { PrismaService } from "../prisma/prisma.service";

const makeRow = (overrides: Partial<{
  id: bigint; actorIdx: bigint; action: string;
  targetType: string; targetId: string; reason: string | null;
  ip: string | null; createdAt: Date; before: unknown; after: unknown;
}> = {}) => ({
  id: BigInt(1),
  actorIdx: BigInt(10),
  action: "user.suspend",
  targetType: "user",
  targetId: "42",
  reason: null,
  ip: "127.0.0.1",
  createdAt: new Date("2026-01-01"),
  before: null,
  after: null,
  ...overrides,
});

const mockPrisma = () => ({
  adminAuditLog: {
    create: jest.fn().mockResolvedValue({}),
    findMany: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
    findUnique: jest.fn().mockResolvedValue(null),
    deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
  },
});

describe("AuditService", () => {
  let service: AuditService;
  let prisma: ReturnType<typeof mockPrisma>;
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(async () => {
    prisma = mockPrisma();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(AuditService);
    logSpy = jest.spyOn(Logger.prototype, "log").mockImplementation();
    errorSpy = jest.spyOn(Logger.prototype, "error").mockImplementation();
  });

  afterEach(() => jest.restoreAllMocks());

  // ──────────────── log() ────────────────

  describe("log()", () => {
    it("Winston에 JSON 문자열을 기록한다", () => {
      const entry = { actorIdx: 1, action: "user.suspend", targetType: "user", targetId: "42" };
      service.log(entry);
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('"action":"user.suspend"'),
      );
    });

    it("DB create를 호출한다", async () => {
      service.log({ actorIdx: 1, action: "a", targetType: "t", targetId: "1" });
      await Promise.resolve(); // fire-and-forget flush
      expect(prisma.adminAuditLog.create).toHaveBeenCalledTimes(1);
    });

    it("DB 실패 시 에러를 로깅하고 예외를 던지지 않는다", async () => {
      prisma.adminAuditLog.create.mockRejectedValueOnce(new Error("DB down"));
      expect(() =>
        service.log({ actorIdx: 1, action: "a", targetType: "t", targetId: "1" }),
      ).not.toThrow();
      await Promise.resolve();
      await Promise.resolve(); // catch 핸들러 실행까지 microtask 두 번
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("DB down"));
    });

    it("before/after/reason/ip 없는 최소 엔트리도 정상 동작한다", () => {
      expect(() =>
        service.log({ actorIdx: 2, action: "b", targetType: "t", targetId: "99" }),
      ).not.toThrow();
    });
  });

  // ──────────────── list() ────────────────

  describe("list()", () => {
    it("필터 없이 호출하면 기본 페이지네이션을 사용한다", async () => {
      prisma.adminAuditLog.findMany.mockResolvedValueOnce([makeRow()]);
      prisma.adminAuditLog.count.mockResolvedValueOnce(1);

      const res = await service.list({});
      expect(res.page).toBe(1);
      expect(res.totalPages).toBe(1);
      expect(res.total).toBe(1);
      expect(res.items).toHaveLength(1);
    });

    it("actor 필터를 where에 포함한다", async () => {
      prisma.adminAuditLog.findMany.mockResolvedValueOnce([]);
      prisma.adminAuditLog.count.mockResolvedValueOnce(0);

      await service.list({ actor: 7 });
      const call = prisma.adminAuditLog.findMany.mock.calls[0][0];
      expect(call.where).toMatchObject({ actorIdx: BigInt(7) });
    });

    it("page/limit으로 skip/take를 계산한다", async () => {
      prisma.adminAuditLog.findMany.mockResolvedValueOnce([]);
      prisma.adminAuditLog.count.mockResolvedValueOnce(200);

      const res = await service.list({ page: 3, limit: 10 });
      const call = prisma.adminAuditLog.findMany.mock.calls[0][0];
      expect(call.skip).toBe(20);
      expect(call.take).toBe(10);
      expect(res.totalPages).toBe(20);
    });

    it("targetType 필터를 where에 포함한다", async () => {
      prisma.adminAuditLog.findMany.mockResolvedValueOnce([]);
      prisma.adminAuditLog.count.mockResolvedValueOnce(0);

      await service.list({ targetType: "user" });
      const call = prisma.adminAuditLog.findMany.mock.calls[0][0];
      expect(call.where).toMatchObject({ targetType: "user" });
    });

    it("targetId 필터를 where에 포함한다", async () => {
      prisma.adminAuditLog.findMany.mockResolvedValueOnce([]);
      prisma.adminAuditLog.count.mockResolvedValueOnce(0);

      await service.list({ targetId: "42" });
      const call = prisma.adminAuditLog.findMany.mock.calls[0][0];
      expect(call.where).toMatchObject({ targetId: "42" });
    });

    it("action 필터를 where에 포함한다", async () => {
      prisma.adminAuditLog.findMany.mockResolvedValueOnce([]);
      prisma.adminAuditLog.count.mockResolvedValueOnce(0);

      await service.list({ action: "user.suspend" });
      const call = prisma.adminAuditLog.findMany.mock.calls[0][0];
      expect(call.where).toMatchObject({ action: "user.suspend" });
    });
  });

  // ──────────────── get() ────────────────

  describe("get()", () => {
    it("존재하는 로그의 before/after를 포함해 반환한다", async () => {
      const row = makeRow({ before: { status: "active" }, after: { status: "suspended" } });
      prisma.adminAuditLog.findUnique.mockResolvedValueOnce(row);

      const detail = await service.get("1");
      expect(detail.before).toEqual({ status: "active" });
      expect(detail.after).toEqual({ status: "suspended" });
    });

    it("존재하지 않으면 NotFoundException을 던진다", async () => {
      prisma.adminAuditLog.findUnique.mockResolvedValueOnce(null);
      await expect(service.get("999")).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  // ──────────────── pruneOldLogs() ────────────────

  describe("pruneOldLogs()", () => {
    it("삭제된 건수가 있으면 로그를 남긴다", async () => {
      prisma.adminAuditLog.deleteMany.mockResolvedValueOnce({ count: 5 });
      await service.pruneOldLogs();
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining("5건 삭제"),
      );
    });

    it("삭제된 건수가 0이면 로그를 남기지 않는다", async () => {
      prisma.adminAuditLog.deleteMany.mockResolvedValueOnce({ count: 0 });
      await service.pruneOldLogs();
      expect(logSpy).not.toHaveBeenCalled();
    });

    it("1년 전 기준으로 삭제한다", async () => {
      prisma.adminAuditLog.deleteMany.mockResolvedValueOnce({ count: 0 });
      const before = new Date();
      await service.pruneOldLogs();
      const call = prisma.adminAuditLog.deleteMany.mock.calls[0][0];
      const cutoff: Date = call.where.createdAt.lt;
      const diffYears =
        (before.getTime() - cutoff.getTime()) / (1000 * 60 * 60 * 24 * 365);
      expect(diffYears).toBeCloseTo(1, 1);
    });
  });
});
