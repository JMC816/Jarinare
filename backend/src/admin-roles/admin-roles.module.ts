import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AuditModule } from "../audit/audit.module";
import { RolePermissionsModule } from "../role-permissions/role-permissions.module";
import { AdminRolesController } from "./admin-roles.controller";
import { AdminRolesService } from "./admin-roles.service";

@Module({
  imports: [PrismaModule, AuditModule, RolePermissionsModule],
  controllers: [AdminRolesController],
  providers: [AdminRolesService],
})
export class AdminRolesModule {}
