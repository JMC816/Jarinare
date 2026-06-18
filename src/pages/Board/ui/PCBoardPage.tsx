/**
 * @role: pages — PC 게시판 허브 페이지
 * @rule: 레이아웃·조합만 담당, 비즈니스 로직 포함 금지
 */
import { useNavigate } from 'react-router-dom';
import PCTopNav from '@/widgets/layouts/ui/PCTopNav';
import PCSidebar from '@/widgets/layouts/ui/PCSidebar';
import { useLatestPosts } from '@/features/Board/hooks/useLatestPosts';
import { useTopViewedPost } from '@/features/Board/hooks/useTopViewedPost';
import SeasonBanner from '@/widgets/Season/ui/SeasonBanner';
import TravelReviewTicker from '@/widgets/TravelReview/ui/TravelReviewTicker';
import { usePCBoardPage } from '../hooks/usePCBoardPage';
import { useBoardCounts } from '@/features/Board/hooks/useBoardCounts';
import {
  BOARDS,
  BOARD_CATEGORIES,
  BOARD_DROPDOWN_ITEMS,
} from '../constants/boardPageConstants';

const PCBoardPage = () => {
  const navigate = useNavigate();
  const { latest } = useLatestPosts();

  const { topPost } = useTopViewedPost();
  const {
    searchQuery,
    setSearchQuery,
    handleSearch,
    boardDropdownOpen,
    setBoardDropdownOpen,
    isNew,
    formatDate,
    totalReviewCount,
  } = usePCBoardPage();
  const { counts } = useBoardCounts();

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <PCTopNav hasNotification={false} />

      <div className="flex w-full flex-1 gap-0">
        <PCSidebar />

        <main
          className="relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden"
          style={{ height: 'calc(100vh - 3.5rem)' }}
        >
          <div className="px-16 pb-16 pt-10">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-black text-gray-900">
                  게시판 종합
                </h1>
                <p className="mt-1 text-sm text-gray-400">
                  다양한 여행 정보와 소식을 확인하세요
                </p>
              </div>
              <div className="flex items-center gap-2">
                <form onSubmit={handleSearch} className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="게시물 검색"
                    className="rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue"
                  />
                </form>
                <button
                  onClick={() => navigate('/board/board')}
                  className="flex items-center gap-2 rounded-lg bg-blue px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue/90"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                  </svg>
                  글쓰기
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {/* 이벤트 */}
              <SeasonBanner />

              {/* 2x2 그리드 — 왼쪽 3fr, 오른쪽 1fr, 행 높이 동일 */}
              <div className="grid grid-cols-[4fr_1fr] gap-6">
                {/* [row1, col1] 베스트 여행지 후기 */}
                <div className="overflow-hidden">
                  <TravelReviewTicker title="베스트 여행지 후기" />
                </div>

                {/* [row1, col2] 실시간 인기 게시물 */}
                <div className="flex flex-col overflow-hidden rounded-xl bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                    </svg>
                    <h2 className="text-lg font-bold text-gray-800">
                      실시간 인기 게시물
                    </h2>
                  </div>
                  {topPost ? (
                    <>
                      <button
                        onClick={() =>
                          navigate(
                            topPost.category === 'board'
                              ? '/board/board/detail'
                              : '/board/event/detail',
                            {
                              state:
                                topPost.category === 'board'
                                  ? {
                                      post: {
                                        id: topPost.id,
                                        title: topPost.title,
                                        content: topPost.content,
                                        author: topPost.author,
                                        likes: 0,
                                        views: topPost.viewCount,
                                        createdAt: 0,
                                        imageUrl: null,
                                      },
                                    }
                                  : {
                                      event: {
                                        id: topPost.id,
                                        title: topPost.title,
                                        content: topPost.content,
                                        author: topPost.author,
                                        likes: 0,
                                        views: topPost.viewCount,
                                        createdAt: 0,
                                        imageUrl: null,
                                      },
                                    },
                            },
                          )
                        }
                        className="flex flex-1 flex-col gap-2 p-1 text-left"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="w-fit rounded-md bg-lightBlue px-2 py-0.5 text-[10px] font-bold text-blue">
                            {topPost.category === 'board'
                              ? '자유게시판'
                              : '이벤트'}
                          </span>
                          <span className="flex shrink-0 items-center gap-1 text-[10px] text-gray-400">
                            <svg
                              width="11"
                              height="11"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            {topPost.viewCount}
                          </span>
                        </div>
                        <span className="line-clamp-2 text-sm font-bold text-gray-800">
                          {topPost.title}
                        </span>
                        <span className="line-clamp-2 text-xs text-gray-400">
                          {topPost.content}
                        </span>
                      </button>
                      <button
                        onClick={() => navigate('/board/boardlist')}
                        className="mt-3 w-full rounded-lg border border-gray-100 py-2 text-xs font-bold text-gray-400 transition-colors hover:bg-gray-50"
                      >
                        인기글 더보기
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-1 items-center justify-center text-xs text-gray-400">
                      조회수 데이터가 없습니다
                    </div>
                  )}
                </div>

                {/* [row2, col1] 통합게시판 */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <h2 className="text-lg font-bold text-gray-600">
                      통합게시판
                    </h2>
                    <div className="relative ml-auto">
                      <button
                        onClick={() => setBoardDropdownOpen((v) => !v)}
                        className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-50"
                      >
                        전체 카테고리
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                      {boardDropdownOpen && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-32 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md">
                          {BOARD_DROPDOWN_ITEMS.map(({ label, path }) => (
                            <button
                              key={label}
                              onClick={() => {
                                navigate(path);
                                setBoardDropdownOpen(false);
                              }}
                              className="flex w-full px-4 py-2 text-xs text-gray-600 hover:bg-gray-50"
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col overflow-hidden rounded-xl border border-gray-100 shadow-sm">
                    {/* 타이틀 행 — 1/4 */}
                    <div className="flex items-center gap-3 bg-gray-50 px-5 py-3">
                      <span className="w-[44px] shrink-0 text-center text-[10px] font-bold text-gray-400">
                        분류
                      </span>
                      <span className="flex-1 text-[10px] font-bold text-gray-400">
                        제목
                      </span>
                      <span className="w-[56px] shrink-0 text-right text-[10px] font-bold text-gray-400">
                        작성자
                      </span>
                      <span className="w-[52px] shrink-0 text-right text-[10px] font-bold text-gray-400">
                        날짜
                      </span>
                      <span className="w-[28px] shrink-0 text-right text-[10px] font-bold text-gray-400">
                        조회
                      </span>
                    </div>
                    {/* 게시물 행 — 3/4 */}
                    <div className="flex flex-col bg-white">
                      {BOARDS.map(
                        ({ key, badge, path, bgColor, textColor }) => {
                          const post = latest[key];
                          const hasNew = isNew(post?.createdAt, key);
                          const dateStr = post?.createdAt
                            ? formatDate(post.createdAt)
                            : '-';
                          return (
                            <button
                              key={key}
                              onClick={() => navigate(path)}
                              className="flex w-full items-center gap-3 border-b border-gray-50 px-5 py-4 text-left transition-colors last:border-b-0 hover:bg-gray-50"
                            >
                              <span
                                className="w-[44px] shrink-0 rounded-md px-1.5 py-0.5 text-center text-[10px] font-bold"
                                style={{
                                  backgroundColor: bgColor,
                                  color: textColor,
                                }}
                              >
                                {badge}
                              </span>
                              <span className="flex-1 truncate text-xs text-gray-400">
                                {post ? post.title : '등록된 게시물이 없습니다'}
                                {hasNew && (
                                  <span className="ml-1.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue text-[8px] font-bold text-white">
                                    N
                                  </span>
                                )}
                              </span>
                              <span className="w-[56px] shrink-0 truncate text-right text-[10px] text-gray-400">
                                {post?.author || '-'}
                              </span>
                              <span className="w-[52px] shrink-0 text-right text-[10px] text-gray-400">
                                {dateStr}
                              </span>
                              <span className="w-[28px] shrink-0 text-right text-[10px] text-gray-400">
                                {post?.viewCount ?? '-'}
                              </span>
                            </button>
                          );
                        },
                      )}
                    </div>
                    {/* 페이지네이션 */}
                    <div
                      className="flex items-center justify-center gap-1 bg-gray-50 px-5 py-3"
                      style={{ minHeight: 'var(--header-h)' }}
                    >
                      <button className="flex items-center justify-center px-1 text-gray-400 hover:text-gray-600">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="15 18 9 12 15 6" />
                        </svg>
                      </button>
                      {[1, 2, 3].map((page) => (
                        <button
                          key={page}
                          className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold transition-colors ${page === 1 ? 'bg-blue text-white' : 'text-gray-400 hover:bg-gray-200'}`}
                        >
                          {page}
                        </button>
                      ))}
                      <button className="flex items-center justify-center px-1 text-gray-400 hover:text-gray-600">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* [row2, col2] 카테고리 */}
                <div className="flex flex-col self-start overflow-hidden rounded-xl bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-800">
                      카테고리
                    </h2>
                  </div>
                  <div className="flex flex-col gap-2">
                    {BOARD_CATEGORIES.map(
                      ({ key, label, path, iconStroke }) => (
                        <button
                          key={key}
                          onClick={() => navigate(path)}
                          className="flex w-full items-center gap-3 rounded-lg px-1 py-0.5 text-left transition-colors hover:bg-lightBlue"
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center">
                            {/* 카테고리별 아이콘 렌더링 */}
                            {key === 'notice' && (
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke={iconStroke}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line
                                  x1="12"
                                  y1="16"
                                  x2="12.01"
                                  y2="16"
                                  strokeWidth="3"
                                />
                              </svg>
                            )}
                            {key === 'event' && (
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke={iconStroke}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            )}
                            {key === 'board' && (
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke={iconStroke}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                              </svg>
                            )}
                            {key === 'review' && (
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke={iconStroke}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                              </svg>
                            )}
                          </div>
                          <span className="flex-1 text-sm text-gray-800">
                            {label}
                          </span>
                          <span className="rounded-md bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-400">
                            {key === 'review'
                              ? totalReviewCount
                              : counts[key as keyof typeof counts]}
                          </span>
                        </button>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PCBoardPage;
