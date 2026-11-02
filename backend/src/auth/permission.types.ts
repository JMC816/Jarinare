export type Permission =
  | "user:view"
  | "user:suspend"
  | "user:delete"
  | "report:view"
  | "report:resolve"
  | "report:delete"
  | "board:delete"
  | "board:create"
  | "membership:view"
  | "membership:manage"
  | "card:view"
  | "card:manage"
  | "scheduler:view"
  | "scheduler:run"
  | "dashboard:view"
  | "notification:send"
  | "reservation:view"
  | "admin:manage";

const ALL_PERMISSIONS: Permission[] = [
  "user:view",
  "user:suspend",
  "user:delete",
  "report:view",
  "report:resolve",
  "report:delete",
  "board:delete",
  "board:create",
  "membership:view",
  "membership:manage",
  "card:view",
  "card:manage",
  "scheduler:view",
  "scheduler:run",
  "dashboard:view",
  "notification:send",
  "reservation:view",
  "admin:manage",
];

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  user: [],
  cs: [
    "dashboard:view",
    "user:view",
    "report:view",
    "reservation:view",
    "membership:view",
    "card:view",
    "scheduler:view",
  ],
  marketer: [
    "dashboard:view",
    "membership:view",
    "membership:manage",
    "card:view",
    "card:manage",
    "board:create",
    "notification:send",
  ],
  operator: [
    "dashboard:view",
    "user:view",
    "user:suspend",
    "report:view",
    "report:resolve",
    "board:delete",
    "board:create",
    "scheduler:view",
    "scheduler:run",
    "reservation:view",
  ],
  super_admin: ALL_PERMISSIONS,
};

export function hasPermission(role: string, permission: Permission): boolean {
  return (ROLE_PERMISSIONS[role] ?? []).includes(permission);
}
