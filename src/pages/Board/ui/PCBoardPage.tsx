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
import { BOARD_CATEGORIES, FILTER_TABS } from '../constants/boardPageConstants';

const PCBoardPage = () => {
  const navigate = useNavigate();
  const { latest, isLoading: isLatestLoading } = useLatestPosts();

  const { topPosts } = useTopViewedPost();
  const {
    searchQuery,
    setSearchQuery,
    handleSearch,
    activeFilter,
    setActiveFilter,
    isNew,
    formatDate,
    totalReviewCount,
    filteredBoards,
    getDetailNav,
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
          <div className="px-32 pb-16 pt-10">
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

              {/* 베스트 여행지 후기 — 가로 풀 */}
              <div className="overflow-hidden">
                <TravelReviewTicker title="베스트 여행지 후기" />
              </div>

              {/* 2열 그리드 — 왼쪽 4fr(통합게시판), 오른쪽 1fr(인기게시물+카테고리) */}
              <div className="grid grid-cols-[4fr_1fr] items-stretch gap-6">
                {/* [col1] 통합게시판 */}
                <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                  {/* 카드 내부 헤더: 제목 + 필터 탭 */}
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
                    <div className="ml-auto flex items-center gap-1 rounded-[3px] bg-gray-100 p-1">
                      {FILTER_TABS.map(({ label }) => (
                        <button
                          key={label}
                          onClick={() => setActiveFilter(label)}
                          className={`rounded-[3px] px-3 py-1 text-xs font-bold transition-colors ${
                            activeFilter === label
                              ? 'bg-blue text-white'
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* 게시물 행 */}
                  <div className="flex flex-1 flex-col bg-white">
                    {isLatestLoading ? (
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
                    ) : activeFilter === '후기' ? (
                      <div className="flex flex-1 items-center justify-center py-10 text-sm text-gray-300">
                        여행지 후기 게시물이 없습니다
                      </div>
                    ) : (
                      filteredBoards.map(
                        ({ key, badge, bgColor, textColor }) => {
                          const post = latest[key];
                          const hasNew = isNew(post?.createdAt, key);
                          const dateStr = post?.createdAt
                            ? formatDate(post.createdAt)
                            : '-';
                          const detailNav = post
                            ? getDetailNav(key, post)
                            : null;

                          return (
                            <button
                              key={key}
                              onClick={() =>
                                detailNav &&
                                navigate(detailNav.path, {
                                  state: detailNav.state,
                                })
                              }
                              className="relative flex w-full items-center gap-6 px-5 py-4 text-left transition-colors hover:bg-gray-50"
                            >
                              <span className="absolute inset-x-5 bottom-0 border-b border-gray-100" />
                              <span
                                className="w-[44px] shrink-0 rounded-[3px] px-1.5 py-0.5 text-center text-[10px] font-bold"
                                style={{
                                  backgroundColor: bgColor,
                                  color: textColor,
                                }}
                              >
                                {badge}
                              </span>
                              <span className="flex-1 truncate text-base font-bold text-gray-800">
                                {post ? post.title : '등록된 게시물이 없습니다'}
                                {(post?.commentCount ?? 0) > 0 && (
                                  <span className="ml-2 inline-flex items-center justify-center align-middle text-sm font-bold text-blue">
                                    [{post!.commentCount}]
                                  </span>
                                )}
                                {hasNew && (
                                  <span className="ml-2 inline-flex items-center justify-center rounded-[3px] bg-lightImpossible px-1.5 py-0.5 align-middle text-[10px] font-bold text-red">
                                    NEW
                                  </span>
                                )}
                              </span>
                              <span className="w-[56px] shrink-0 truncate text-right text-sm text-gray-400">
                                {post?.author || '-'}
                              </span>
                              <span className="w-[52px] shrink-0 text-right text-sm text-gray-400">
                                {dateStr}
                              </span>
                              <span className="w-[28px] shrink-0 text-right text-sm text-gray-400">
                                {post?.viewCount ?? '-'}
                              </span>
                            </button>
                          );
                        },
                      )
                    )}
                  </div>
                  {/* 페이지네이션 */}
                  <div
                    className="flex items-center justify-center gap-1 px-5 py-3"
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

                {/* [col2] 실시간 인기 게시물 + 카테고리 (세로 적층) */}
                <div className="flex flex-col gap-6">
                  {/* 실시간 인기 */}
                  <div className="flex flex-col overflow-hidden rounded-xl bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                      <span className="text-lg">🔥</span>
                      <h2 className="text-lg font-bold text-gray-800">
                        실시간 인기
                      </h2>
                    </div>
                    <div className="flex flex-col divide-y divide-gray-100">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const post = topPosts[i];
                        const rankColor =
                          i === 0
                            ? '#ef4444'
                            : i === 1
                              ? '#f97316'
                              : i === 2
                                ? '#ca8a04'
                                : '#9ca3af';
                        if (!post) {
                          return (
                            <div
                              key={i}
                              className="flex items-center gap-2.5 py-3"
                            >
                              <span
                                className="w-4 shrink-0 text-center text-sm font-black"
                                style={{ color: rankColor }}
                              >
                                {i + 1}
                              </span>
                              <span className="flex-1 truncate text-xs text-gray-300">
                                -
                              </span>
                            </div>
                          );
                        }
                        const categoryLabel =
                          post.category === 'board' ? '자유' : '이벤트';
                        return (
                          <button
                            key={post.id}
                            onClick={() =>
                              navigate(
                                post.category === 'board'
                                  ? '/board/board/detail'
                                  : '/board/event/detail',
                                {
                                  state:
                                    post.category === 'board'
                                      ? {
                                          post: {
                                            id: post.id,
                                            title: post.title,
                                            content: post.content,
                                            author: post.author,
                                            likes: 0,
                                            views: post.viewCount,
                                            createdAt: 0,
                                            imageUrl: null,
                                          },
                                        }
                                      : {
                                          event: {
                                            id: post.id,
                                            title: post.title,
                                            content: post.content,
                                            author: post.author,
                                            likes: 0,
                                            views: post.viewCount,
                                            createdAt: 0,
                                            imageUrl: null,
                                          },
                                        },
                                },
                              )
                            }
                            className="flex items-start gap-2.5 py-3 text-left"
                          >
                            <span
                              className="mt-0.5 w-4 shrink-0 text-center text-sm font-black"
                              style={{ color: rankColor }}
                            >
                              {i + 1}
                            </span>
                            <div className="flex min-w-0 flex-col gap-0.5">
                              <span className="truncate text-base font-semibold text-gray-800">
                                {post.title}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {categoryLabel} - {post.viewCount}
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
                          <span className="rounded-md bg-lightBlue px-2 py-0.5 text-[10px] font-bold text-blue">
                            {key === 'review'
                              ? totalReviewCount
                              : counts[key as keyof typeof counts]}
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
