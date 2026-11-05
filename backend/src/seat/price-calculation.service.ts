// @role: features/seat
// @rule: 운임 계산만 담당 — 외부 입력(카드사·포인트)을 DB 값으로 검증·계산한다
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

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
    selectedCard?: string | null;
    usedPoint: number;
  }): Promise<PriceCalcResult> {
    const { adultcharge, seatCount, arrName, selectedCard, usedPoint } = params;
    const currentMonth = new Date().getMonth() + 1;

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

    // 3. 카드 할인 (card_discounts 테이블)
    let discountRate = 0;
    let paybackRate = 0;
    if (selectedCard) {
      const card = await this.prisma.cardDiscount.findFirst({
        where: { cardName: selectedCard, isActive: true },
      });
      if (card) {
        discountRate = Number(card.discountRate);
        paybackRate = Number(card.paybackRate);
      }
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
