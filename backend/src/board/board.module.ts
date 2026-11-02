// @role: app/module
import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { BoardController } from "./board.controller";
import { BoardService } from "./board.service";
import { NotificationModule } from "../notification/notification.module";
import { RolePermissionsModule } from "../role-permissions/role-permissions.module";

@Module({
  imports: [PrismaModule, NotificationModule, RolePermissionsModule],
  controllers: [BoardController],
  providers: [BoardService],
})
export class BoardModule {}
