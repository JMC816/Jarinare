import { RolePermissionsService } from "./role-permissions.service";

const mockPrisma = () => ({
  adminRole: {
    findMany: jest.fn().mockResolvedValue([]),
  },
});

describe("RolePermissionsService", () => {
  let service: RolePermissionsService;
  let prisma: ReturnType<typeof mockPrisma>;

  const seedRoles = () =>
    prisma.adminRole.findMany.mockResolvedValueOnce([
      { role: "cs", permissions: ["user:view", "report:view"] },
      { role: "super_admin", permissions: ["admin:manage", "user:view"] },
    ]);

  beforeEach(() => {
    prisma = mockPrisma();
    service = new RolePermissionsService(prisma as never);
    jest.useFakeTimers();
  });

  afterEach(() => jest.useRealTimers());

  // ──────────────── getPermissions() ────────────────

  describe("getPermissions()", () => {
    it("DB에서 권한 목록을 가져온다", async () => {
      seedRoles();
      const perms = await service.getPermissions("cs");
      expect(perms).toEqual(["user:view", "report:view"]);
    });

    it("존재하지 않는 역할은 빈 배열을 반환한다", async () => {
      seedRoles();
      const perms = await service.getPermissions("unknown");
      expect(perms).toEqual([]);
    });

    it("TTL 내 두 번째 호출은 DB를 조회하지 않는다 (캐시 히트)", async () => {
      seedRoles();
      await service.getPermissions("cs");
      await service.getPermissions("cs");
      expect(prisma.adminRole.findMany).toHaveBeenCalledTimes(1);
    });

    it("TTL 만료 후 호출은 DB를 다시 조회한다", async () => {
      seedRoles();
      await service.getPermissions("cs");

      jest.advanceTimersByTime(60_001); // TTL 60s 초과
      seedRoles();
      await service.getPermissions("cs");

      expect(prisma.adminRole.findMany).toHaveBeenCalledTimes(2);
    });
  });

  // ──────────────── hasPermission() ────────────────

  describe("hasPermission()", () => {
    it("보유한 권한이면 true를 반환한다", async () => {
      seedRoles();
      expect(await service.hasPermission("cs", "user:view")).toBe(true);
    });

    it("없는 권한이면 false를 반환한다", async () => {
      seedRoles();
      expect(await service.hasPermission("cs", "admin:manage")).toBe(false);
    });
  });

  // ──────────────── invalidate() ────────────────

  describe("invalidate()", () => {
    it("캐시를 초기화하면 다음 호출에서 DB를 다시 조회한다", async () => {
      seedRoles();
      await service.getPermissions("cs"); // 캐시 적재
      expect(prisma.adminRole.findMany).toHaveBeenCalledTimes(1);

      service.invalidate();

      seedRoles();
      await service.getPermissions("cs"); // 캐시 무효화 → DB 재조회
      expect(prisma.adminRole.findMany).toHaveBeenCalledTimes(2);
    });

    it("TTL 내라도 invalidate 후엔 캐시를 사용하지 않는다", async () => {
      seedRoles();
      await service.getPermissions("super_admin");

      service.invalidate();

      seedRoles();
      const perms = await service.getPermissions("super_admin");
      expect(perms).toEqual(["admin:manage", "user:view"]);
      expect(prisma.adminRole.findMany).toHaveBeenCalledTimes(2);
    });
  });
});
