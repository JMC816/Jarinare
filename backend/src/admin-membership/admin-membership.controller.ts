import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { Permissions } from "../auth/decorators/permissions.decorator";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { AdminMembershipService } from "./admin-membership.service";
import { CreateMembershipTierDto, UpdateMembershipTierDto } from "./dto/admin-membership.dto";

@ApiBearerAuth()
@ApiTags("Admin - 멤버십")
@Controller("admin/membership-tiers")
export class AdminMembershipController {
  constructor(private readonly adminMembership: AdminMembershipService) {}

  @Get()
  @ApiOperation({ summary: "멤버십 등급 목록" })
  @Permissions("membership:manage")
  listTiers() {
    return this.adminMembership.listTiers();
  }

  @Get(":id")
  @ApiOperation({ summary: "멤버십 등급 상세" })
  @Permissions("membership:manage")
  getTier(@Param("id") id: string) {
    return this.adminMembership.getTier(BigInt(id));
  }

  @Post()
  @ApiOperation({ summary: "멤버십 등급 생성" })
  @Permissions("membership:manage")
  createTier(@Body() dto: CreateMembershipTierDto, @Req() req: Request & { user: AuthUser }) {
    return this.adminMembership.createTier(dto, req.user, req.ip);
  }

  @Patch(":id")
  @ApiOperation({ summary: "멤버십 등급 수정" })
  @Permissions("membership:manage")
  updateTier(
    @Param("id") id: string,
    @Body() dto: UpdateMembershipTierDto,
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.adminMembership.updateTier(BigInt(id), dto, req.user, req.ip);
  }

  @Delete(":id")
  @ApiOperation({ summary: "멤버십 등급 삭제 (보유 회원 있으면 실패)" })
  @Permissions("membership:manage")
  deleteTier(@Param("id") id: string, @Req() req: Request & { user: AuthUser }) {
    return this.adminMembership.deleteTier(BigInt(id), req.user, req.ip);
  }
}
