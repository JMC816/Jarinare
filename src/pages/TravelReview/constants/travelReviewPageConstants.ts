/**
 * @role: pages — 여행지 후기 페이지 상수 정의
 * @rule: 상수 정의만 담당
 */
export const PROFILE_COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
];

export const getProfileColor = (name: string) =>
  PROFILE_COLORS[(name?.charCodeAt(0) ?? 0) % PROFILE_COLORS.length];
