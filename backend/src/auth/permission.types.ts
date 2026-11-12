export type Permission =
  | "dashboard:read"
  | "user:read"
  | "user:suspend"
  | "point:adjust"
  | "admin:manage"
  | "report:read"
  | "report:resolve"
  | "membership:manage"
  | "discount:manage"
  | "board:manage"
  | "reservation:read"
  | "reservation:manage"
  | "notification:send"
  | "scheduler:read"
  | "scheduler:run";

export const PERMISSIONS: Permission[] = [
  "dashboard:read",
  "user:read",
  "user:suspend",
  "point:adjust",
  "admin:manage",
  "report:read",
  "report:resolve",
  "membership:manage",
  "discount:manage",
  "board:manage",
  "reservation:read",
  "reservation:manage",
  "notification:send",
  "scheduler:read",
  "scheduler:run",
];
