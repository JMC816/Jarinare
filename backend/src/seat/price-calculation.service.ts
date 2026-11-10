// @role: features/seat
// @rule: 운임 계산만 담당 — 외부 입력(카드사·포인트)을 DB 값으로 검증·계산한다
import { HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AppException } from "../common/errors/app.exception";
import { ErrorCode } from "../common/errors/error-code";

function isCurrentMonth(start: number, end: number, current: number): boolean {
  // 겨울처럼 연도 경계를 넘는 경우 (startMonth=12, endMonth=2)
  if (start <= end) return current >= start && current <= end;
  return current >= start || current <= end;
}

export interface PriceCalcResult {
  basePrice: number;
  seasonDiscountApplied: boolean;
  cardDiscountAmount: number;
  usedPoint: number;
  finalPrice: number;
  paybackPoint: number;
}

@Injectable()
export class PriceCalculationService {
  constructor(private readonly prisma: PrismaService) {}

  async calculate(params: {
    adultcharge: number;
    seatCount: number;
    arrName: string;
    paymentMethod?: string | null;
    selectedCard?: string | null;
    usedPoint: number;
  }): Promise<PriceCalcResult> {
    const { adultcharge, seatCount, arrName, paymentMethod, selectedCard, usedPoint } = params;

    if (adultcharge <= 0) {
      throw new AppException(
        ErrorCode.TRAIN_FARE_UNAVAILABLE,
        "운임 정보를 확인할 수 없거나 매진된 열차입니다.",
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const isCreditCard = paymentMethod === "신용카드";
    // UTC 서버에서도 KST(+9) 기준으로 월을 판단
    const kstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
    const currentMonth = kstNow.getUTCMonth() + 1;

    // 1. 기준 운임
    const basePrice = adultcharge * seatCount;

    // 2. 계절 이벤트 할인 (season_events 테이블)
    const seasonEvents = await this.prisma.seasonEvent.findMany({
      where: { isActive: true },
    });
    const matchedSeason = seasonEvents.find((e) => {
      if (!isCurrentMonth(e.startMonth, e.endMonth, currentMonth)) return false;
      const stations = e.stations as string[];
      return stations.includes(arrName);
    });
    const seasonDiscountApplied = !!matchedSeason;
    const seasonRate = matchedSeason ? Number(matchedSeason.discountRate) : 0;
    const afterSeasonPrice = seasonDiscountApplied
      ? Math.floor(basePrice * (1 - seasonRate))
      : basePrice;

    // 3. 카드 할인 (card_discounts 테이블) — 신용카드 결제 시에만 적용
    let discountRate = 0;
    let paybackRate = 0;
    if (isCreditCard && selectedCard) {
      const card = await this.prisma.cardDiscount.findFirst({
        where: { cardName: selectedCard, isActive: true },
      });
      if (!card) {
        throw new AppException(
          ErrorCode.INVALID_CARD,
          `등록되지 않은 카드입니다: ${selectedCard}`,
          HttpStatus.BAD_REQUEST,
        );
      }
      discountRate = Number(card.discountRate);
      paybackRate = Number(card.paybackRate);
    }
    const cardDiscountAmount = Math.floor(afterSeasonPrice * discountRate);
    const afterCardPrice = afterSeasonPrice - cardDiscountAmount;

    // 4. 포인트 차감 (실제 잔액 검증은 PointService.applyPayment 에서)
    const pointDeduction = Math.min(usedPoint, afterCardPrice);
    const finalPrice = Math.max(0, afterCardPrice - pointDeduction);

    // 5. 카드 페이백
    const paybackPoint = Math.floor(finalPrice * paybackRate);

    return {
      basePrice,
      seasonDiscountApplied,
      cardDiscountAmount,
      usedPoint: pointDeduction,
      finalPrice,
      paybackPoint,
    };
  }
}
