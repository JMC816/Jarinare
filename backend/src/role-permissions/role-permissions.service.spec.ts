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
      { code: "CS", permissions: ["user:read", "report:read"] },
      { code: "SUPER_ADMIN", permissions: ["admin:manage", "user:read"] },
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
      const perms = await service.getPermissions("CS");
      expect(perms).toEqual(["user:read", "report:read"]);
    });

    it("존재하지 않는 역할은 빈 배열을 반환한다", async () => {
      seedRoles();
      const perms = await service.getPermissions("unknown");
      expect(perms).toEqual([]);
    });

    it("TTL 내 두 번째 호출은 DB를 조회하지 않는다 (캐시 히트)", async () => {
      seedRoles();
      await service.getPermissions("CS");
      await service.getPermissions("CS");
      expect(prisma.adminRole.findMany).toHaveBeenCalledTimes(1);
    });

    it("TTL 만료 후 호출은 DB를 다시 조회한다", async () => {
      seedRoles();
      await service.getPermissions("CS");

      jest.advanceTimersByTime(60_001); // TTL 60s 초과
      seedRoles();
      await service.getPermissions("CS");

      expect(prisma.adminRole.findMany).toHaveBeenCalledTimes(2);
    });
  });

  // ──────────────── hasPermission() ────────────────

  describe("hasPermission()", () => {
    it("보유한 권한이면 true를 반환한다", async () => {
      seedRoles();
      expect(await service.hasPermission("CS", "user:read")).toBe(true);
    });

    it("없는 권한이면 false를 반환한다", async () => {
      seedRoles();
      expect(await service.hasPermission("CS", "admin:manage")).toBe(false);
    });
  });

  // ──────────────── invalidate() ────────────────

  describe("invalidate()", () => {
    it("캐시를 초기화하면 다음 호출에서 DB를 다시 조회한다", async () => {
      seedRoles();
      await service.getPermissions("CS"); // 캐시 적재
      expect(prisma.adminRole.findMany).toHaveBeenCalledTimes(1);

      service.invalidate();

      seedRoles();
      await service.getPermissions("CS"); // 캐시 무효화 → DB 재조회
      expect(prisma.adminRole.findMany).toHaveBeenCalledTimes(2);
    });

    it("TTL 내라도 invalidate 후엔 캐시를 사용하지 않는다", async () => {
      seedRoles();
      await service.getPermissions("SUPER_ADMIN");

      service.invalidate();

      seedRoles();
      const perms = await service.getPermissions("SUPER_ADMIN");
      expect(perms).toEqual(["admin:manage", "user:read"]);
      expect(prisma.adminRole.findMany).toHaveBeenCalledTimes(2);
    });
  });
});
