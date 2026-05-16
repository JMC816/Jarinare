/**
 * @role: widgets — Ticker 무한 반복 애니메이션 상태 관리
 * @rule: 별점순 상위 4개 선택 로직만 담당, 렌더링 포함 금지
 */
import { DestinationReviewSummary } from '@/entities/TravelReview/types/travelReviewType';

const TICKER_COUNT = 4;

export const useTravelReviewTicker = (
  summaries: DestinationReviewSummary[],
) => {
  // 리뷰가 있는 도시만 필터링 후 별점순 상위 4개 선택
  const tickerItems = summaries
    .filter((s) => s.reviewCount > 0)
    .slice(0, TICKER_COUNT);

  return { tickerItems };
};
