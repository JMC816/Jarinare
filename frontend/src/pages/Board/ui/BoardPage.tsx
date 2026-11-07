/**
 * @role: pages — 모바일 게시판 허브 페이지
 * @rule: 렌더링·조합만 담당, 비즈니스 로직 포함 금지
 */
import backward from '@/assets/icons/backward.png';
import SeasonBanner from '@/widgets/Season/ui/SeasonBanner';
import TravelReviewTicker from '@/widgets/TravelReview/ui/TravelReviewTicker';
import { useNavigate } from 'react-router-dom';
import PCBoardPage from './PCBoardPage';
import { usePCBoardPage } from '../hooks/usePCBoardPage';
import { FILTER_TABS, CAT_STYLE_MAP } from '../constants/boardPageConstants';
import { useBoardRead } from '@/features/Board/hooks/useBoardRead';

const BoardPage = () => {
  const navigate = useNavigate();
  const { activeFilter, setActiveFilter, pagedPosts, formatDate, isLoading } = usePCBoardPage();
  const { readIds } = useBoardRead();

  return (
    <>
      <div className="hidden w-full lg:block">
        <PCBoardPage />
      </div>
      <div className="relative flex h-screen w-full flex-col bg-gray-50 lg:hidden">
        {/* 헤더 */}
        <div className="shrink-0 flex w-full items-center bg-white/80 px-[28px] pb-[4px] pt-[20px] backdrop-blur-md">
          <div className="flex items-center gap-3">
            <img
              onClick={() => navigate(-1)}
              src={backward}
              className="h-[20px] w-[12px] cursor-pointer"
            />
            <span className="text-lg font-bold">게시판</span>
          </div>
        </div>
        <div className="shrink-0 h-2 w-full border-b border-gray-200/50 bg-white/80" />

        {/* 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto">

        {/* 계절 할인 배너 */}
        <div className="px-4 pb-2">
          <SeasonBanner />
        </div>

        {/* 여행후기 */}
        <div className="px-4 -mb-3">
          <TravelReviewTicker title="여행후기" square />
        </div>

        {/* 통합게시판 */}
        <div className="px-4 pb-24 pt-4">
          {/* 카드 외부 제목 행 */}
          <div className="mb-2 flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <h2 className="text-lg font-bold text-gray-900">통합게시판</h2>
            <button
              onClick={() => navigate('/board/boardlist')}
              className="ml-auto flex items-center gap-0.5 text-sm font-bold text-gray-400 active:opacity-60"
            >
              더보기
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            {/* 필터 탭 */}
            <div className="flex items-center gap-2 px-4 pb-2 pt-3">
              <div className="flex items-center gap-0.5 rounded-sm bg-gray-100 p-0.5">
                {FILTER_TABS.map(({ label }) => (
                  <button
                    key={label}
                    onClick={() => setActiveFilter(label)}
                    className={`rounded-sm px-3.5 py-1.5 text-sm font-bold transition-colors ${
                      activeFilter === label ? 'bg-blue text-white' : 'text-gray-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 게시물 행 */}
            <div className="flex flex-col">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="relative flex items-center gap-3 px-4 py-3">
                    <span className="absolute inset-x-4 bottom-0 border-b border-gray-100" />
                    <div className="h-4 w-10 animate-pulse rounded-[3px] bg-gray-100" />
                    <div className="h-4 flex-1 animate-pulse rounded bg-gray-100" />
                    <div className="h-4 w-10 animate-pulse rounded bg-gray-100" />
                  </div>
                ))
              ) : pagedPosts.length === 0 ? (
                <div className="flex h-20 items-center justify-center text-sm text-gray-300">
                  게시물이 없습니다
                </div>
              ) : (
                pagedPosts.slice(0, 7).map((post) => {
                  const style = CAT_STYLE_MAP[post._category];
                  return (
                    <button
                      key={post.id}
                      onClick={() =>
                        navigate(`/board/${post.id}?type=${style.type}`, {
                          state: {
                            [style.stateKey]: {
                              id: post.id,
                              title: post.title,
                              content: post.content,
                              author: post.author,
                              liked: post.liked,
                              views: post.views,
                              createdAt: post.createdAt,
                              imageUrl: post.imageUrl,
                            },
                          },
                        })
                      }
                      className="relative flex w-full items-center gap-3 px-4 py-3 text-left active:bg-gray-50"
                    >
                      <span className="absolute inset-x-4 bottom-0 border-b border-gray-100" />
                      <span
                        className="w-[46px] shrink-0 rounded-[3px] px-1 py-0.5 text-center text-xs font-bold"
                        style={{ backgroundColor: style.bgColor, color: style.textColor }}
                      >
                        {style.badge}
                      </span>
                      <span className="flex flex-1 items-center gap-1 overflow-hidden">
                        <span className="truncate text-base font-bold text-gray-800">
                          {post.title}
                          {(post.commentCount ?? 0) > 0 && (
                            <span className="ml-1 text-sm font-bold text-blue">
                              [{post.commentCount}]
                            </span>
                          )}
                        </span>
                        {!readIds.includes(post.id) && (
                          <span className="shrink-0 text-xs font-black text-red">[NEW]</span>
                        )}
                      </span>
                      <span className="shrink-0 text-sm text-gray-400">
                        {formatDate(post.createdAt)}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

          </div>
        </div>
        </div> {/* 스크롤 영역 끝 */}
      </div>
    </>
  );
};

export default BoardPage;
