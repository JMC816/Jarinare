export interface AuthUser {
  idx: number;
  email: string;
  role: UserRole;
  adminRoleCode?: string;
}

export type UserRole =
  | "user"
  | "cs"
  | "marketer"
  | "operator"
  | "super_admin";
