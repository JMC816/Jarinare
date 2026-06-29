/**
 * @role: widgets — 게시판 위젯 타입 정의
 * @rule: 타입 정의만 담당
 */
export type SortOrder = 'newest' | 'oldest' | 'views' | 'likes';

export interface BoardProps {
  isPC?: boolean;
  externalSearchQuery?: string;
  externalSortOrder?: 'newest' | 'views';
}
