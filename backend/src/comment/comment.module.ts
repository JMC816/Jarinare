// @role: app/module
import { Module } from "@nestjs/common";
import { CommentController } from "./comment.controller";
import { CommentService } from "./comment.service";
import { NotificationModule } from "../notification/notification.module";
import { RolePermissionsModule } from "../role-permissions/role-permissions.module";

@Module({
  imports: [NotificationModule, RolePermissionsModule],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
