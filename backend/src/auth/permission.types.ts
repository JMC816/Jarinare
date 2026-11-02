export type Permission =
  | "user:view"
  | "user:suspend"
  | "user:delete"
  | "report:view"
  | "report:resolve"
  | "report:delete"
  | "board:delete"
  | "board:create"
  | "membership:manage"
  | "card:manage"
  | "scheduler:run"
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
  "membership:manage",
  "card:manage",
  "scheduler:run",
  "notification:send",
  "reservation:view",
  "admin:manage",
];

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  user: [],
  cs: ["user:view", "report:view", "reservation:view"],
  marketer: [
    "membership:manage",
    "card:manage",
    "board:create",
    "notification:send",
  ],
  operator: [
    "user:view",
    "user:suspend",
    "report:view",
    "report:resolve",
    "board:delete",
    "board:create",
    "scheduler:run",
    "reservation:view",
  ],
  super_admin: ALL_PERMISSIONS,
};

export function hasPermission(role: string, permission: Permission): boolean {
  return (ROLE_PERMISSIONS[role] ?? []).includes(permission);
}
