import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "../auth/decorators/public.decorator";
import { AdminDiscountService } from "./admin-discount.service";

@ApiTags("카드 할인")
@Controller("card-discounts")
export class CardDiscountsController {
  constructor(private readonly adminDiscount: AdminDiscountService) {}

  @Public()
  @Get("active")
  @ApiOperation({ summary: "활성 카드 할인 목록 (사용자 결제 화면용, 공개)" })
  listActive() {
    return this.adminDiscount.listActiveDiscounts();
  }
}
