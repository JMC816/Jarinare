import { Module } from "@nestjs/common";
import { RolePermissionsService } from "./role-permissions.service";

@Module({
  providers: [RolePermissionsService],
  exports: [RolePermissionsService],
})
export class RolePermissionsModule {}
