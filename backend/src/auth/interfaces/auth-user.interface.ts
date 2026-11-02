export interface AuthUser {
  idx: number;
  email: string;
  role: UserRole;
}

export type UserRole =
  | "user"
  | "cs"
  | "marketer"
  | "operator"
  | "super_admin";
