/**
 * @role: widgets — 백엔드 알림 카드 (comment / reply / like / seat_change)
 * @rule: 렌더링만 담당, 상태·로직 포함 금지
 */
import { elapsedTime } from '@/shared/lib/formatDate';
import { getProfileColor } from '@/shared/lib/profileColor';
import type { BackendNotification } from '../types/backendNotificationType';
import { pendingChangeRequestStore } from '@/features/Notification/models/pendingChangeRequestStore';
import { responesBySeatIdStore } from '../model/responseBySeatIdStore';
import useNotifiModalStore from '@/widgets/model/Notification';
import { useNavigate } from 'react-router-dom';

interface Props {
  notification: BackendNotification;
  onClick: () => void;
  onDelete?: () => void;
}

const BADGE: Record<string, { label: string; className: string }> = {
  comment: { label: '댓글', className: 'bg-blue/10 text-blue' },
  reply: { label: '대댓글', className: 'bg-purple-100 text-purple-600' },
  board_like: { label: '좋아요', className: 'bg-lightImpossible text-red' },
  comment_like: { label: '댓글 좋아요', className: 'bg-orange-100 text-orange-500' },
  seat_change_request: { label: '좌석 변경 요청', className: 'bg-yellow-100 text-yellow-700' },
  seat_change_accepted: { label: '변경 수락', className: 'bg-emerald-100 text-emerald-700' },
  seat_change_rejected: { label: '변경 거절', className: 'bg-red/10 text-red' },
};

const BackendNotificationItem = ({ notification, onClick, onDelete }: Props) => {
  const navigate = useNavigate();
  const { openModal } = useNotifiModalStore();
  const { type, isRead, createdAt, payload } = notification;
  const badge = BADGE[type] ?? { label: type, className: 'bg-gray-100 text-gray-500' };
  const senderName = payload.commenterName ?? payload.likerName ?? payload.requesterName ?? '';

  const getMessage = () => {
    if (type === 'comment')
      return (
        <><span className="font-bold text-blue">{senderName}</span>님이 회원님의 게시물에 댓글을 달았습니다.</>
      );
    if (type === 'reply')
      return (
        <><span className="font-bold text-blue">{senderName}</span>님이 회원님의 댓글에 대댓글을 달았습니다.</>
      );
    if (type === 'board_like')
      return (
        <><span className="font-bold text-blue">{senderName}</span>님이 회원님의 게시물을 좋아합니다.</>
      );
    if (type === 'comment_like')
      return (
        <><span className="font-bold text-blue">{senderName}</span>님이 회원님의 댓글을 좋아합니다.</>
      );
    if (type === 'seat_change_request') {
      const toSeats = payload.to ?? payload.empty ?? [];
      return (
        <>
          <span className="font-bold text-blue">{senderName}</span>님이{' '}
          <span className="font-bold">{toSeats.map((s) => s.seatId).join(', ')}</span> 좌석으로 변경을 요청했습니다.
        </>
      );
    }
    if (type === 'seat_change_accepted')
      return <>좌석 변경 요청이 수락되었습니다.</>;
    if (type === 'seat_change_rejected')
      return <>좌석 변경 요청이 거절되었습니다.</>;
    return null;
  };

  const hasCommentContent =
    (type === 'comment' || type === 'reply' || type === 'comment_like') &&
    payload.commentContent;

  const handleClick = () => {
    onClick();
    if (type === 'seat_change_request' && payload.requestId) {
      pendingChangeRequestStore.getState().setChangeRequestId(payload.requestId);
      const toSeats = payload.to ?? payload.empty ?? [];
      responesBySeatIdStore.getState().setSeatIds(toSeats.map((s) => s.seatId));
      openModal('ResponseModal');
      return;
    }
    if (payload.path) navigate(payload.path);
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative cursor-pointer rounded-sm px-4 py-3 mb-2 ${isRead ? 'bg-gray-100' : 'bg-white'}`}
      style={{
        boxShadow:
          '0 1px 3px rgba(0,0,0,0.05), 0 -1px 3px rgba(0,0,0,0.05), 1px 0 3px rgba(0,0,0,0.05), -1px 0 3px rgba(0,0,0,0.05)',
      }}
    >
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -right-1.5 -top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-gray-400/80 text-white opacity-0 transition-opacity hover:bg-gray-600 group-hover:opacity-100"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
      {type === 'seat_change_accepted' || type === 'seat_change_rejected' ? (
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <span className={`w-fit rounded-full px-2 py-0.5 text-xs font-bold ${badge.className}`}>
              {badge.label}
            </span>
            <p className="text-tiny text-gray-800">{getMessage()}</p>
          </div>
          <span className="text-xs text-darkGray">
            {elapsedTime(new Date(createdAt).getTime())}
          </span>
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between">
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${badge.className}`}>
              {badge.label}
            </span>
            <span className="text-xs text-darkGray">
              {elapsedTime(new Date(createdAt).getTime())}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: getProfileColor(senderName) }}
            >
              {senderName.charAt(0)}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <p className="truncate text-tiny text-gray-800">{getMessage()}</p>
              {hasCommentContent && (
                <span className="truncate text-tiny text-gray-500">"{payload.commentContent}"</span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BackendNotificationItem;
