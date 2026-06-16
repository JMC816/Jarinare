export const CATEGORIES = [
  '전체',
  '바다',
  '역사',
  '맛집',
  '자연',
  '야경',
] as const;
export type Category = (typeof CATEGORIES)[number];

export interface DestinationItem {
  city: string;
  desc: string;
  gradient: string;
  category: Category[];
  image?: string;
}
