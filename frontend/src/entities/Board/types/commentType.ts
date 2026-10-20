/**
 * @role: entities — 댓글 도메인 타입 정의
 * @rule: 타입 정의만 담당
 */
export interface Comment {
  id: number;
  author: string;
  content: string;
  createdAt: string;
  parentId: number | null;
  liked: number;
}
