/**
 * @role: pages — PC 게시판 허브 페이지
 * @rule: 레이아웃·조합만 담당, 비즈니스 로직 포함 금지
 */
import { useNavigate } from 'react-router-dom';
import PCTopNav from '@/widgets/layouts/ui/PCTopNav';
import PCSidebar from '@/widgets/layouts/ui/PCSidebar';
import SeasonBanner from '@/widgets/Season/ui/SeasonBanner';
import { usePCBoardPage } from '../hooks/usePCBoardPage';
import {
  BOARD_CATEGORIES,
  FILTER_TABS,
  CAT_STYLE_MAP,
} from '../constants/boardPageConstants';
import { useBoardCounts } from '@/features/Board/hooks/useBoardCounts';
import { useBoardRead } from '@/features/Board/hooks/useBoardRead';
import { useTopViewedPost } from '@/features/Board/hooks/useTopViewedPost';
import { useBookmark } from '@/features/Board/hooks/useBookmark';
import TravelReviewTicker from '@/widgets/TravelReview/ui/TravelReviewTicker';

const PCBoardPage = () => {
  const navigate = useNavigate();

  const {
    searchQuery,
    setSearchQuery,
    handleSearch,
    handleClearSearch,
    activeSearchQuery,
    searchResults,
    activeFilter,
    setActiveFilter,
    formatDate,
    displayPosts,
    currentPage,
    setCurrentPage,
    isLoading,
    pagedPosts,
    showPagination,
    visiblePages,
    totalPages,
  } = usePCBoardPage();

  const { counts } = useBoardCounts();
  const { readIds } = useBoardRead();
  const { topPosts } = useTopViewedPost(3);
  const { bookmarkIds } = useBookmark();
  const countMap: Record<string, number> = {
    notice: counts.notice,
    event: counts.event,
    board: counts.free,
    review: counts.review,
    favorites: bookmarkIds.length,
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <PCTopNav />

      <div className="flex w-full flex-1 gap-0">
        <PCSidebar />

        <main
          className="relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden"
          style={{ height: 'calc(100vh - 3.5rem)' }}
        >
          <div className="px-32 pb-16 pt-10">
            <div className="mb-6">
              <p className="text-xs font-bold tracking-widest text-gray-400">
                COMMUNITY
              </p>
              <h1 className="mt-1 text-2xl font-black text-gray-900">게시판</h1>
              <p className="mt-1 text-sm text-gray-400">
                다양한 여행 정보와 소식을 확인하세요
              </p>
            </div>

            <div className="flex flex-col gap-6">
              {/* 이벤트 */}
              <SeasonBanner />

              {/* 베스트 여행지 후기 */}
              <div className="overflow-hidden">
                <TravelReviewTicker title="베스트 여행지 후기" />
              </div>

              {/* 2열 그리드 — 왼쪽 4fr(통합게시판), 오른쪽 1fr(카테고리) */}
              <div className="grid grid-cols-[4fr_1fr] items-stretch gap-6">
                {/* [col1] 통합게시판 */}
                <div
                  className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
                >
                  {/* 카드 헤더: 제목 + 필터 탭 + 글쓰기 버튼 */}
                  <div className="flex items-center gap-2 px-5 py-4">
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
                    <h2 className="text-lg font-bold text-gray-900">
                      통합게시판
                    </h2>
                    <div className="ml-auto flex items-center gap-2">
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
                          className="rounded-md border border-gray-200 bg-white py-2 pl-9 pr-8 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue"
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={handleClearSearch}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        )}
                      </form>
                      <div className="flex items-center gap-1 rounded-sm bg-gray-100 p-1">
                        {FILTER_TABS.map(({ label }) => (
                          <button
                            key={label}
                            onClick={() => setActiveFilter(label)}
                            className={`rounded-sm px-4 py-1.5 text-sm font-bold transition-colors ${
                              activeFilter === label
                                ? 'bg-blue text-white'
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => navigate('/board/write')}
                        className="flex items-center gap-1.5 rounded-sm bg-blue px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue/90"
                      >
                        <svg
                          width="13"
                          height="13"
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

                  {/* 게시물 행 */}
                  <div className="flex flex-1 flex-col overflow-hidden bg-white">
                    {activeSearchQuery ? (
                      searchResults.length === 0 ? (
                        <div className="flex flex-1 items-center justify-center py-10 text-sm text-gray-300">
                          검색 결과가 없습니다
                        </div>
                      ) : (
                        searchResults.map((post) => {
                          const style = CAT_STYLE_MAP[post._category];
                          return (
                            <button
                              key={post.id}
                              onClick={() =>
                                navigate(`/board/${post.id}?type=${style.type}`, {
                                  state: { [style.stateKey]: post },
                                })
                              }
                              className="relative flex w-full items-center gap-6 px-5 py-4 text-left transition-colors hover:bg-gray-50"
                            >
                              <span className="absolute inset-x-5 bottom-0 border-b border-gray-100" />
                              <span
                                className="w-[44px] shrink-0 rounded-[3px] px-1.5 py-0.5 text-center text-[10px] font-bold"
                                style={{
                                  backgroundColor: style.bgColor,
                                  color: style.textColor,
                                }}
                              >
                                {style.badge}
                              </span>
                              <span className="flex-1 truncate text-base font-bold text-gray-800">
                                {post.title}
                              </span>
                              <span className="w-[56px] shrink-0 truncate text-right text-sm text-gray-400">
                                {post.author}
                              </span>
                              <span className="w-[52px] shrink-0 text-right text-sm text-gray-400">
                                {formatDate(post.createdAt)}
                              </span>
                            </button>
                          );
                        })
                      )
                    ) : isLoading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className="relative flex items-center gap-6 px-5 py-4"
                        >
                          <span className="absolute inset-x-5 bottom-0 border-b border-gray-100" />
                          <div className="h-5 w-12 animate-pulse rounded-[3px] bg-gray-100" />
                          <div className="h-4 flex-1 animate-pulse rounded bg-gray-100" />
                          <div className="h-4 w-14 animate-pulse rounded bg-gray-100" />
                          <div className="h-4 w-12 animate-pulse rounded bg-gray-100" />
                          <div className="h-4 w-8 animate-pulse rounded bg-gray-100" />
                        </div>
                      ))
                    ) : displayPosts.length === 0 ? (
                      <div className="flex flex-1 items-center justify-center py-10 text-sm text-gray-300">
                        게시물이 없습니다
                      </div>
                    ) : (
                      pagedPosts.map((post) => {
                        const style = CAT_STYLE_MAP[post._category];
                        return (
                          <button
                            key={post.id}
                            onClick={() => {
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
                              });
                            }}
                            className="relative flex w-full items-center gap-6 px-5 py-4 text-left transition-colors hover:bg-gray-50"
                          >
                            <span className="absolute inset-x-5 bottom-0 border-b border-gray-100" />
                            <span
                              className="w-[44px] shrink-0 rounded-[3px] px-1.5 py-0.5 text-center text-[10px] font-bold"
                              style={{
                                backgroundColor: style.bgColor,
                                color: style.textColor,
                              }}
                            >
                              {style.badge}
                            </span>
                            <span className="flex flex-1 items-center gap-1.5 overflow-hidden">
                              <span className="truncate text-base font-bold text-gray-800">
                                {post.title}
                                {(post.commentCount ?? 0) > 0 && (
                                  <span className="ml-2 text-sm font-bold text-blue">
                                    [{post.commentCount}]
                                  </span>
                                )}
                              </span>
                              {!readIds.includes(post.id) && (
                                <span className="shrink-0 text-[10px] font-black text-red">
                                  [NEW]
                                </span>
                              )}
                            </span>
                            <span className="w-[56px] shrink-0 truncate text-right text-sm text-gray-400">
                              {post.author}
                            </span>
                            <span className="w-[52px] shrink-0 text-right text-sm text-gray-400">
                              {formatDate(post.createdAt)}
                            </span>
                            <span className="w-[28px] shrink-0 text-right text-sm text-gray-400">
                              {post.views ?? 0}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* 페이지네이션 */}
                  {showPagination && (
                    <div className="flex items-center justify-center gap-1.5 px-5 py-4">
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(0, currentPage - 1))
                        }
                        disabled={currentPage === 0}
                        className="flex items-center justify-center px-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <svg
                          width="16"
                          height="16"
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
                      {visiblePages.map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`flex h-7 w-7 items-center justify-center rounded text-xs font-bold transition-colors ${
                            page === currentPage
                              ? 'bg-blue text-white'
                              : 'text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          {page + 1}
                        </button>
                      ))}
                      <button
                        onClick={() =>
                          setCurrentPage(
                            Math.min(totalPages - 1, currentPage + 1),
                          )
                        }
                        disabled={currentPage === totalPages - 1}
                        className="flex items-center justify-center px-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <svg
                          width="16"
                          height="16"
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
                  )}
                </div>

                {/* [col2] 실시간 인기 + 카테고리 */}
                <div className="flex min-w-0 flex-col gap-6">
                  {/* 실시간 인기 */}
                  <div className="flex flex-col rounded-xl bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                      <span className="text-lg">🔥</span>
                      <h2 className="text-lg font-bold text-gray-800">실시간 인기</h2>
                      <div className="group relative flex items-center">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#9ca3af"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="cursor-pointer"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <div className="pointer-events-none absolute left-5 top-0 z-10 w-48 rounded-lg bg-gray-800 px-3 py-2 text-sm leading-relaxed text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                          <p className="mb-1 font-bold">인기지수 산정 기준</p>
                          <p>조회 수</p>
                          <p>+ 좋아요 수</p>
                          <p>+ 공유 수 (1인 1회)</p>
                          <p>+ 즐겨찾기 수 (1인 1회)</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col divide-y divide-gray-100">
                      {Array.from({ length: 3 }).map((_, i) => {
                        const post = topPosts[i];
                        const rankColor =
                          i === 0 ? '#ef4444' : i === 1 ? '#f97316' : i === 2 ? '#ca8a04' : '#9ca3af';
                        if (!post) {
                          return (
                            <div key={i} className="flex items-center gap-2.5 py-3">
                              <span className="w-4 shrink-0 text-center text-sm font-black" style={{ color: rankColor }}>
                                {i + 1}
                              </span>
                              <span className="flex-1 truncate text-xs text-gray-300">-</span>
                            </div>
                          );
                        }
                        const detailStateKey = post.type === 'free' ? 'post' : post.type === 'event' ? 'event' : 'notice';
                        return (
                          <button
                            key={post.id}
                            onClick={() =>
                              navigate(`/board/${post.id}?type=${post.type}`, {
                                state: { [detailStateKey]: { id: post.id, title: post.title, author: post.author } },
                              })
                            }
                            className="flex w-full items-start gap-2.5 overflow-hidden py-3 text-left"
                          >
                            <span className="mt-0.5 w-4 shrink-0 text-center text-sm font-black" style={{ color: rankColor }}>
                              {i + 1}
                            </span>
                            <div className="flex min-w-0 flex-col gap-0.5">
                              <span className="truncate text-base font-semibold text-gray-800">{post.title}</span>
                              <span className="text-xs text-gray-400">
                                {post.type === 'free' ? '자유' : post.type === 'event' ? '이벤트' : post.type === 'review' ? '후기' : '공지'} · 인기지수 {post.score}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 카테고리 */}
                  <div className="flex flex-col overflow-hidden rounded-xl bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <h2 className="text-lg font-bold text-gray-800">
                        카테고리
                      </h2>
                    </div>
                    <div className="flex flex-col divide-y divide-gray-100">
                      {BOARD_CATEGORIES.map(({ key, label, path }) => (
                        <button
                          key={key}
                          onClick={() => navigate(path)}
                          className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:opacity-70"
                        >
                          <span className="flex-1 text-sm text-gray-800">
                            {label}
                          </span>
                          <span className="text-xs font-bold text-gray-400">
                            {countMap[key] ?? 0}
                          </span>
                        </button>
                      ))}
                    </div>
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
