/**
 * @role: widgets — 게시판 위젯 타입 정의
 * @rule: 타입 정의만 담당
 */
import { BoardType } from '@/features/Board/types/boardType';

export type SortOrder = 'newest' | 'oldest' | 'views' | 'likes';

export interface BoardProps {
  isPC?: boolean;
  externalSearchQuery?: string;
  externalSortOrder?: 'newest' | 'views';
}

export interface PCWriteFormProps extends BoardType {
  categoryLabel: string;
  backLabel: string;
}
