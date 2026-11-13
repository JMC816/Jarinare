import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { Permissions } from "../auth/decorators/permissions.decorator";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { AdminDiscountService } from "./admin-discount.service";
import { CreateCardDiscountDto, UpdateCardDiscountDto } from "./dto/admin-discount.dto";

@ApiBearerAuth()
@ApiTags("Admin - 카드 할인")
@Controller("admin/discounts")
export class AdminDiscountController {
  constructor(private readonly adminDiscount: AdminDiscountService) {}

  @Get()
  @ApiOperation({ summary: "카드 할인 목록" })
  @Permissions("discount:manage")
  listDiscounts() {
    return this.adminDiscount.listDiscounts();
  }

  @Get(":id")
  @ApiOperation({ summary: "카드 할인 상세" })
  @Permissions("discount:manage")
  getDiscount(@Param("id") id: string) {
    return this.adminDiscount.getDiscount(BigInt(id));
  }

  @Post()
  @ApiOperation({ summary: "카드 할인 생성" })
  @Permissions("discount:manage")
  createDiscount(@Body() dto: CreateCardDiscountDto, @Req() req: Request & { user: AuthUser }) {
    return this.adminDiscount.createDiscount(dto, req.user, req.ip);
  }

  @Patch(":id")
  @ApiOperation({ summary: "카드 할인 수정" })
  @Permissions("discount:manage")
  updateDiscount(
    @Param("id") id: string,
    @Body() dto: UpdateCardDiscountDto,
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.adminDiscount.updateDiscount(BigInt(id), dto, req.user, req.ip);
  }

  @Delete(":id")
  @ApiOperation({ summary: "카드 할인 삭제" })
  @Permissions("discount:manage")
  deleteDiscount(@Param("id") id: string, @Req() req: Request & { user: AuthUser }) {
    return this.adminDiscount.deleteDiscount(BigInt(id), req.user, req.ip);
  }
}
