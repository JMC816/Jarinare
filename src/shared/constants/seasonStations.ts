/**
 * @role: shared — 계절별 추천 역 및 현재 계절 반환 유틸
 * @rule: 상수 및 순수 함수만 포함, 상태 금지
 */

export const SEASON_STATIONS = {
  봄: [
    '남춘천',
    '양평',
    '곡성',
    '구례구',
    '순천',
    '청평',
    '가평',
    '평창',
    '진부',
    '풍기',
    '영주',
  ],
  여름: [
    '강릉',
    '정동진',
    '묵호',
    '동해',
    '삼척',
    '부산',
    '울산',
    '포항',
    '여수EXPO',
    '목포',
    '장항',
    '대천',
  ],
  가을: [
    '안동',
    '제천',
    '단양',
    '영월',
    '태백',
    '원주',
    '문경',
    '남원',
    '밀양',
    '청도',
    '홍성',
  ],
  겨울: [
    '횡성',
    '둔내',
    '평창',
    '진부',
    '강릉',
    '태백',
    '민둥산',
    '고한',
    '사북',
    '정선',
    '아우라지',
  ],
} as const;

export type Season = keyof typeof SEASON_STATIONS;

export const SEASON_STYLE: Record<
  Season,
  {
    emoji: string;
    color: string;
    bg: string;
    badgeBg: string;
    badgeBorder: string;
    gradient: string;
    subText: string;
  }
> = {
  봄: {
    emoji: '🌸',
    color: 'text-pink-600',
    bg: 'bg-pink-100',
    badgeBg: 'bg-pink-200',
    badgeBorder: 'border-pink-300',
    gradient: 'linear-gradient(160deg, #f9a8d4 0%, #fbcfe8 40%, #e9d5ff 100%)',
    subText: '벚꽃 만개, 봄 여행 최적기',
  },
  여름: {
    emoji: '☀️',
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    badgeBg: 'bg-amber-200',
    badgeBorder: 'border-amber-300',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #0ea5e9 50%, #22d3ee 100%)',
    subText: '청량한 바다, 여름 특가',
  },
  가을: {
    emoji: '🍂',
    color: 'text-orange-600',
    bg: 'bg-orange-100',
    badgeBg: 'bg-orange-200',
    badgeBorder: 'border-orange-300',
    gradient: 'linear-gradient(160deg, #ea580c 0%, #f97316 40%, #fbbf24 100%)',
    subText: '단풍 절경, 가을 낭만 여행',
  },
  겨울: {
    emoji: '❄️',
    color: 'text-blue-500',
    bg: 'bg-blue-100',
    badgeBg: 'bg-blue-200',
    badgeBorder: 'border-blue-300',
    gradient: 'linear-gradient(160deg, #1e3a5f 0%, #1e40af 40%, #3b82f6 100%)',
    subText: '설경 속 힐링, 겨울 여행',
  },
};

export const getCurrentSeason = (): Season => {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return '봄';
  if (month >= 6 && month <= 8) return '여름';
  if (month >= 9 && month <= 11) return '가을';
  return '겨울';
};
