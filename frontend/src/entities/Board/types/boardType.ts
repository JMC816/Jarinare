/**
 * @role: entities — 게시판 도메인 타입 정의
 * @rule: 타입 정의만 담당
 */

export type BoardType = 'free' | 'notice' | 'event' | 'review';
export type SortOrder = 'asc' | 'desc';

export interface BoardPost {
  id: number;
  title: string;
  author: string;
  createdAt: string;
  imageUrl: string | null;
  commentCount: number;
  tags: string[];
  liked: number;
  content?: string;
  views?: number;
  rating?: number;
}

export interface BoardDetail extends BoardPost {
  content: string;
}

export interface FreeBoardDetail extends BoardDetail {
  comments: import('./commentType').Comment[];
}

export interface ReviewDetail extends BoardDetail {
  rating: number;
}

export interface BoardPagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface BoardListResponse {
  items: BoardPost[];
  pagination: BoardPagination;
}
