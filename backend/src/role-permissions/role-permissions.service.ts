import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

const CACHE_TTL = 60_000;

@Injectable()
export class RolePermissionsService {
  private cache: Map<string, string[]> | null = null;
  private cacheExpiry = 0;

  constructor(private readonly prisma: PrismaService) {}

  async getPermissions(role: string): Promise<string[]> {
    await this.ensureCache();
    return this.cache!.get(role) ?? [];
  }

  async hasPermission(role: string, permission: string): Promise<boolean> {
    const perms = await this.getPermissions(role);
    return perms.includes(permission);
  }

  invalidate(): void {
    this.cache = null;
    this.cacheExpiry = 0;
  }

  private async ensureCache(): Promise<void> {
    if (this.cache && Date.now() < this.cacheExpiry) return;
    const rows = await this.prisma.adminRole.findMany();
    const map = new Map<string, string[]>();
    for (const row of rows) {
      const perms = Array.isArray(row.permissions)
        ? (row.permissions as string[])
        : (JSON.parse(row.permissions as string) as string[]);
      map.set(row.role, perms);
    }
    this.cache = map;
    this.cacheExpiry = Date.now() + CACHE_TTL;
  }
}
