import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AuditModule } from "../audit/audit.module";
import { AdminDiscountController } from "./admin-discount.controller";
import { CardDiscountsController } from "./card-discounts.controller";
import { AdminDiscountService } from "./admin-discount.service";

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [AdminDiscountController, CardDiscountsController],
  providers: [AdminDiscountService],
})
export class AdminDiscountModule {}
