/**
 * @role: entities — 백엔드 알림 도메인 타입
 * @rule: 타입 정의만 담당
 */
export type BackendNotificationType =
  | 'comment'
  | 'reply'
  | 'board_like'
  | 'comment_like'
  | 'seat_change_request'
  | 'seat_change_accepted'
  | 'seat_change_rejected';

export interface SeatRef {
  carNo: number;
  seatId: string;
}

export interface BackendNotificationPayload {
  // 게시판 알림
  commenterName?: string;
  likerName?: string;
  boardId?: number;
  boardType?: string;
  boardTitle?: string;
  commentContent?: string;
  path?: string;
  // 좌석 변경 알림
  requestId?: number;
  tripId?: number;
  trainNo?: string;
  requesterName?: string;
  from?: SeatRef[];
  to?: SeatRef[];
  empty?: SeatRef[];
  expiresAt?: string;
}

export interface BackendNotification {
  id: number;
  type: BackendNotificationType;
  isRead: boolean;
  createdAt: string;
  payload: BackendNotificationPayload;
}
