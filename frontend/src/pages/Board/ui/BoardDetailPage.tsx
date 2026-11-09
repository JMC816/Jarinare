/**
 * @role: pages — 자유게시판 상세 페이지 (PC: PCBoardDetailPage 위임)
 * @rule: 레이아웃·조합만 담당, 비즈니스 로직 포함 금지
 */
import backward from '@/assets/icons/backward.png';
import { BoardPost, FreeBoardDetail } from '@/entities/Board/types/boardType';
import { formatBoardTime } from '@/shared/lib/formatDate';
import { getProfileColor } from '@/shared/lib/profileColor';
import { CommentSection } from '@/widgets/Board/ui/CommentSection';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PCBoardDetailPage from './PCBoardDetailPage';
import { useBoardDetailPage } from '../hooks/useBoardDetailPage';
import { toBackendImageUrl } from '@/shared/api/backendClient';
import { getBoardDetailApi } from '@/features/Board/api/getBoardApi';
import { useBoardRead } from '@/features/Board/hooks/useBoardRead';

const BoardDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [fetchedPost, setFetchedPost] = useState<FreeBoardDetail | null>(null);

  const statePost = location.state?.post as BoardPost | undefined;
  const post = fetchedPost ?? statePost ?? undefined;

  const { markRead } = useBoardRead();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!id || hasFetched.current) return;
    hasFetched.current = true;
    if (!statePost || !statePost.content) {
      getBoardDetailApi(Number(id), 'free').then(setFetchedPost).catch(() => {});
    }
    markRead(Number(id));
  }, [id]);

  const {
    currentPost,
    isOwner,
    isLiked,
    likesCount,
    menuOpen,
    setMenuOpen,
    handleDelete,
    handleLike,
    isBookmarked,
    handleBookmark,
  } = useBoardDetailPage(post);

  if (!currentPost) {
    return (
      <>
        <div className="hidden w-full lg:block">
          <PCBoardDetailPage post={post} />
        </div>
        <div className="flex h-screen w-full items-center justify-center lg:hidden">
          <p className="text-gray-400">게시글을 찾을 수 없습니다.</p>
        </div>
      </>
    );
  }

  const viewCount = currentPost.views ?? 0;

  return (
    <>
      <div className="hidden w-full lg:block">
        <PCBoardDetailPage post={post} />
      </div>

      <div className="flex h-screen w-full flex-col bg-gray-50 lg:hidden">
        {/* 헤더 */}
        <div className="shrink-0 flex w-full items-center bg-white/80 px-[28px] pb-[4px] pt-[20px] backdrop-blur-md">
          <div className="flex items-center gap-3">
            <img onClick={() => navigate(-1)} src={backward} className="h-[20px] w-[12px] cursor-pointer" />
            <span className="text-lg font-bold">자유게시판</span>
          </div>
        </div>
        <div className="shrink-0 h-2 w-full border-b border-gray-200/50 bg-white/80" />

        {/* 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-4 mt-4 overflow-hidden rounded-xl bg-white shadow-sm">
            {/* 제목 영역 */}
            <div className="px-5 pb-4 pt-5">
              <span className="mb-2 inline-block rounded px-2 py-0.5 text-xs font-bold" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                자유
              </span>
              <h1 className="mb-3 text-xl font-black leading-snug text-gray-900">
                {currentPost.title}
              </h1>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: getProfileColor(currentPost.author ?? '') }}
                  >
                    {currentPost.author?.charAt(0) ?? '?'}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-gray-800">{currentPost.author}</span>
                    <span className="text-xs text-gray-400">
                      {formatBoardTime(currentPost.createdAt)} · 조회 {viewCount}
                    </span>
                  </div>
                </div>
                {isOwner && (
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen((v) => !v)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
                    >
                      ···
                    </button>
                    {menuOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                        <div className="absolute right-0 top-9 z-20 min-w-[80px] overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg">
                          <button
                            onClick={() => { navigate('/board/board', { state: { editPost: currentPost } }); setMenuOpen(false); }}
                            className="block w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50"
                          >
                            수정
                          </button>
                          <button
                            onClick={handleDelete}
                            className="hover:bg-red-50 block w-full px-4 py-2.5 text-left text-sm text-red"
                          >
                            삭제
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 구분선 */}
            <div className="mx-5 h-px bg-gray-100" />

            {/* 본문 */}
            <div className="px-5 pb-5 pt-4">
              {currentPost.imageUrl && (
                <div className="mb-4 overflow-hidden rounded-lg">
                  <img
                    src={toBackendImageUrl(currentPost.imageUrl) ?? ''}
                    alt={currentPost.title}
                    className="w-full object-contain"
                  />
                </div>
              )}
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                {currentPost.content}
              </p>
              {currentPost.tags && currentPost.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {currentPost.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-500">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 좋아요 + 즐겨찾기 */}
            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
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

          {/* 댓글 */}
          <div className="mx-4 my-4 overflow-hidden rounded-xl bg-white shadow-sm">
            <CommentSection boardId={currentPost.id} />
          </div>
        </div>
      </div>
    </>
  );
};

export default BoardDetailPage;
