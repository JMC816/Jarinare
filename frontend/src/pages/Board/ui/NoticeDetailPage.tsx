import backward from '@/assets/icons/backward.png';
import { BoardPost } from '@/entities/Board/types/boardType';
import { formatBoardTime } from '@/shared/lib/formatDate';
import { useNavigate, useLocation } from 'react-router-dom';
import { toBackendImageUrl } from '@/shared/api/backendClient';
import { useBoardDetailPage } from '../hooks/useBoardDetailPage';

const NoticeDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const notice = location.state?.notice as BoardPost | undefined;

  const { isLiked, likesCount, handleLike, isBookmarked, handleBookmark } = useBoardDetailPage(notice);

  if (!notice) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>게시글을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col bg-gray-50">
      {/* 헤더 */}
      <div className="flex w-full items-center bg-white/80 px-[28px] pb-[4px] pt-[20px] backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img
            onClick={() => navigate(-1)}
            src={backward}
            className="h-[20px] w-[12px] cursor-pointer"
          />
          <span className="text-lg font-bold">공지사항</span>
        </div>
      </div>
      <div className="h-2 w-full border-b border-gray-200/50 bg-white/80" />

      {/* 게시글 내용 */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="mb-4 bg-white">
          {/* 작성자 정보 */}
          <div className="flex items-center gap-3 p-4 pb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue">
              <span className="text-sm font-bold text-white">관</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">관리자</span>
                <div className="bg-red-500 rounded px-2 py-0.5 text-xs font-bold text-white">
                  공지
                </div>
              </div>
              <span className="text-xs text-gray-500">
                {formatBoardTime(notice.createdAt)}
              </span>
            </div>
          </div>

          {/* 이미지 */}
          {notice.imageUrl && (
            <div className="w-full">
              <img
                src={toBackendImageUrl(notice.imageUrl) ?? ''}
                alt={notice.title}
                className="h-full w-full object-contain"
              />
            </div>
          )}

          {/* 제목 & 내용 */}
          <div className="px-4 pb-2 pt-3 text-base font-bold text-gray-900">{notice.title}</div>
          <div className="px-4 pb-4 text-sm leading-relaxed text-gray-800">
            {notice.content}
          </div>

          {/* 좋아요 + 즐겨찾기 */}
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <button
              onClick={handleLike}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 transition-transform duration-150 active:scale-90"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill={isLiked ? '#ef4444' : 'none'} stroke={isLiked ? '#ef4444' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span className={isLiked ? 'text-red-400' : ''}>좋아요 {likesCount}</span>
            </button>
            <button
              onClick={handleBookmark}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 transition-transform duration-150 active:scale-90"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={isBookmarked ? '#facc15' : 'none'} stroke={isBookmarked ? '#facc15' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span className={isBookmarked ? 'text-yellow-400' : ''}>즐겨찾기</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeDetailPage;
