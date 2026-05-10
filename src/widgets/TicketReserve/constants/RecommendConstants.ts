import { DestinationItem } from '../types/RecommendDestinationType';

export const AGES = ['10대', '20대', '30대', '40대', '50대', '60대+'];

export const DESTINATIONS: DestinationItem[] = [
  {
    city: '부산',
    desc: '해운대·광안리 바다',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
    emoji: '🌊',
    category: ['바다', '야경'],
  },
  {
    city: '경주',
    desc: '천년고도 역사 여행',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    emoji: '🏯',
    category: ['역사'],
  },
  {
    city: '전주',
    desc: '한옥마을·한식 맛집',
    gradient: 'linear-gradient(135deg, #10b981 0%, #065f46 100%)',
    emoji: '🍜',
    category: ['맛집', '역사'],
  },
  {
    city: '강릉',
    desc: '동해 바다·커피 거리',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
    emoji: '☕',
    category: ['바다', '맛집'],
  },
  {
    city: '여수',
    desc: '낭만 항구 야경',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    emoji: '🌅',
    category: ['바다', '야경'],
  },
  {
    city: '춘천',
    desc: '닭갈비·소양강 댐',
    gradient: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
    emoji: '🍗',
    category: ['맛집', '자연'],
  },
];
