import { hasPermission, ROLE_PERMISSIONS, type Permission } from "./permission.types";

describe("hasPermission", () => {
  describe("super_admin", () => {
    it("모든 권한을 가진다", () => {
      const all = Object.keys(ROLE_PERMISSIONS["super_admin"]) as Permission[];
      const permissions: Permission[] = [
        "user:view", "user:suspend", "user:delete",
        "report:view", "report:resolve", "report:delete",
        "board:delete", "board:create",
        "membership:manage", "card:manage",
        "scheduler:run", "notification:send",
        "reservation:view", "admin:manage",
      ];
      permissions.forEach((p) => {
        expect(hasPermission("super_admin", p)).toBe(true);
      });
    });
  });

  describe("operator", () => {
    it("scheduler:run 가능", () => {
      expect(hasPermission("operator", "scheduler:run")).toBe(true);
    });

    it("user:view, user:suspend 가능", () => {
      expect(hasPermission("operator", "user:view")).toBe(true);
      expect(hasPermission("operator", "user:suspend")).toBe(true);
    });

    it("report:view, report:resolve 가능", () => {
      expect(hasPermission("operator", "report:view")).toBe(true);
      expect(hasPermission("operator", "report:resolve")).toBe(true);
    });

    it("board:create, board:delete 가능", () => {
      expect(hasPermission("operator", "board:create")).toBe(true);
      expect(hasPermission("operator", "board:delete")).toBe(true);
    });

    it("admin:manage 불가", () => {
      expect(hasPermission("operator", "admin:manage")).toBe(false);
    });

    it("membership:manage, card:manage 불가", () => {
      expect(hasPermission("operator", "membership:manage")).toBe(false);
      expect(hasPermission("operator", "card:manage")).toBe(false);
    });

    it("user:delete 불가", () => {
      expect(hasPermission("operator", "user:delete")).toBe(false);
    });
  });

  describe("cs", () => {
    it("user:view, report:view, reservation:view 가능", () => {
      expect(hasPermission("cs", "user:view")).toBe(true);
      expect(hasPermission("cs", "report:view")).toBe(true);
      expect(hasPermission("cs", "reservation:view")).toBe(true);
    });

    it("수정·삭제 권한 불가", () => {
      expect(hasPermission("cs", "user:suspend")).toBe(false);
      expect(hasPermission("cs", "user:delete")).toBe(false);
      expect(hasPermission("cs", "report:resolve")).toBe(false);
      expect(hasPermission("cs", "report:delete")).toBe(false);
    });

    it("scheduler:run, admin:manage 불가", () => {
      expect(hasPermission("cs", "scheduler:run")).toBe(false);
      expect(hasPermission("cs", "admin:manage")).toBe(false);
    });
  });

  describe("marketer", () => {
    it("membership:manage, card:manage, board:create, notification:send 가능", () => {
      expect(hasPermission("marketer", "membership:manage")).toBe(true);
      expect(hasPermission("marketer", "card:manage")).toBe(true);
      expect(hasPermission("marketer", "board:create")).toBe(true);
      expect(hasPermission("marketer", "notification:send")).toBe(true);
    });

    it("user:suspend, report:resolve, scheduler:run 불가", () => {
      expect(hasPermission("marketer", "user:suspend")).toBe(false);
      expect(hasPermission("marketer", "report:resolve")).toBe(false);
      expect(hasPermission("marketer", "scheduler:run")).toBe(false);
    });

    it("board:delete 불가", () => {
      expect(hasPermission("marketer", "board:delete")).toBe(false);
    });
  });

  describe("user", () => {
    it("어떤 권한도 없다", () => {
      const permissions: Permission[] = [
        "user:view", "user:suspend", "user:delete",
        "report:view", "report:resolve", "report:delete",
        "board:delete", "board:create",
        "membership:manage", "card:manage",
        "scheduler:run", "notification:send",
        "reservation:view", "admin:manage",
      ];
      permissions.forEach((p) => {
        expect(hasPermission("user", p)).toBe(false);
      });
    });
  });

  describe("알 수 없는 role", () => {
    it("권한이 없다", () => {
      expect(hasPermission("unknown_role", "user:view")).toBe(false);
    });
  });
});
