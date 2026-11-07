/**
 * @role: pages — 이벤트 상세 페이지 (PC + 모바일)
 * @rule: 렌더링·조합만 담당, 비즈니스 로직 포함 금지
 */
import backward from '@/assets/icons/backward.png';
import { BoardDetail, BoardPost } from '@/entities/Board/types/boardType';
import PCEventDetailPage from './PCEventDetailPage';
import { useDeletePost } from '@/features/Board/hooks/useDeletePost';
import { useCurrentUser } from '@/features/Auth/hooks/useCurrentUser';
import { useBoardDetailPage } from '../hooks/useBoardDetailPage';
import { formatBoardTime } from '@/shared/lib/formatDate';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toBackendImageUrl } from '@/shared/api/backendClient';
import { getBoardDetailApi } from '@/features/Board/api/getBoardApi';
import { useBoardRead } from '@/features/Board/hooks/useBoardRead';

const HamburgerIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const EventDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [fetchedEvent, setFetchedEvent] = useState<BoardDetail | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const stateEvent = location.state?.event as BoardPost | undefined;
  const post = fetchedEvent ?? stateEvent ?? undefined;

  const { markRead } = useBoardRead();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!id || hasFetched.current) return;
    hasFetched.current = true;
    if (!stateEvent || !stateEvent.content) {
      getBoardDetailApi(Number(id), 'event').then(setFetchedEvent).catch(() => {});
    }
    markRead(Number(id));
  }, [id]);

  const { deletePost } = useDeletePost();
  const { user } = useCurrentUser();
  const { isLiked, likesCount, handleLike, isBookmarked, handleBookmark } = useBoardDetailPage(post);

  if (!post) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>게시글을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const isOwner = !!user?.name && user.name === post.author;

  const handleDelete = async () => {
    await deletePost(post.id, 'event');
    navigate(-1);
  };

  return (
    <>
      {/* PC 버전 */}
      <div className="hidden w-full lg:block">
        <PCEventDetailPage event={post} />
      </div>

      {/* 모바일 버전 */}
      <div className="flex h-screen w-full flex-col bg-gray-50 lg:hidden">
        {/* 헤더 */}
        <div className="flex w-full items-center justify-between bg-white/80 px-[28px] pb-[4px] pt-[20px] backdrop-blur-md">
          <div className="flex items-center gap-3">
            <img
              onClick={() => navigate(-1)}
              src={backward}
              className="h-[20px] w-[12px] cursor-pointer"
            />
            <span className="text-lg font-bold">이벤트</span>
          </div>
          {isOwner ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
              >
                <HamburgerIcon />
              </button>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-9 z-20 min-w-[80px] overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg">
                    <button
                      onClick={() => {
                        navigate('/board/event', { state: { editPost: post } });
                        setMenuOpen(false);
                      }}
                      className="block w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50"
                    >
                      수정
                    </button>
                    <button
                      onClick={handleDelete}
                      className="text-red-500 hover:bg-red-50 block w-full px-4 py-2.5 text-left text-sm"
                    >
                      삭제
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="w-[12px]" />
          )}
        </div>
        <div className="h-2 w-full border-b border-gray-200/50 bg-white/80" />

        {/* 게시글 내용 */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="mb-4 bg-white">
            {/* 작성자 정보 */}
            <div className="flex items-center gap-x-4 px-4 py-3">
              <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-lg bg-gray-300">
                <span className="text-sm font-bold text-white">
                  {post.author?.charAt(0) ?? '?'}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-y-[2px]">
                <span className="text-base font-bold text-black">
                  {post.author}
                </span>
                <span className="text-xs text-gray-400">
                  {formatBoardTime(post.createdAt)}
                </span>
              </div>
            </div>

            {/* 이미지 */}
            {post.imageUrl && (
              <div className="w-full">
                <img
                  src={toBackendImageUrl(post.imageUrl) ?? ''}
                  alt={post.title}
                  className="w-full object-contain"
                />
              </div>
            )}


            {/* 제목 & 내용 */}
            <div className="px-4 pb-2 pt-3 text-base font-bold text-gray-900">{post.title}</div>
            <div className="px-4 pb-4 text-sm leading-relaxed text-gray-800">
              {post.content}
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
    </>
  );
};

export default EventDetailPage;
