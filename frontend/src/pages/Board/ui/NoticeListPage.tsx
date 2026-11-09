import backward from '@/assets/icons/backward.png';
import WriteButton from '@/shared/ui/WriteButton';
import { useNavigate } from 'react-router-dom';
import PCNoticeListPage from './PCNoticeListPage';
import { usePCNoticeListPage } from '../hooks/usePCNoticeListPage';

const NoticeListPage = () => {
  const navigate = useNavigate();

  const {
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    currentPage,
    setCurrentPage,
    pagedData,
    filteredData,
    totalPages,
    visiblePages,
    isLoading,
    formatDate,
  } = usePCNoticeListPage();

  const showPagination = totalPages > 1;

  return (
    <>
      <div className="hidden w-full lg:block">
        <PCNoticeListPage />
      </div>
      <div className="flex h-screen w-full flex-col bg-gray-50 lg:hidden">
        {/* 헤더 */}
        <div className="shrink-0 flex w-full items-center bg-white/80 px-[28px] pb-[4px] pt-[20px] backdrop-blur-md">
          <div className="flex items-center gap-3">
            <img
              onClick={() => navigate(-1)}
              src={backward}
              className="h-[20px] w-[12px] cursor-pointer"
            />
            <span className="text-lg font-bold">공지사항</span>
          </div>
        </div>
        <div className="shrink-0 h-2 w-full border-b border-gray-200/50 bg-white/80" />

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-3 px-4 pb-24 pt-4">

            {/* 검색 + 정렬 */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="제목, 내용 검색"
                  className="w-full rounded-md border border-gray-200 bg-white py-2 pl-8 pr-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue"
                />
              </div>
              <div className="relative shrink-0">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                  className="w-24 appearance-none rounded-md border border-gray-200 bg-white py-2 pl-3 pr-7 text-sm font-bold text-gray-400 outline-none"
                  style={{ textAlignLast: 'left' }}
                >
                  <option value="newest">최신순</option>
                  <option value="oldest">오래된순</option>
                </select>
                <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            {/* 게시물 카드 */}
            <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
              {/* 컬럼 헤더 */}
              <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-2.5">
                <span className="w-[32px] shrink-0 text-center text-xs font-bold text-gray-400">번호</span>
                <span className="flex-1 text-xs font-bold text-gray-400">제목</span>
                <span className="w-[52px] shrink-0 text-right text-xs font-bold text-gray-400">날짜</span>
              </div>

              {/* 게시물 행 */}
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="relative flex items-center gap-3 px-4 py-3">
                    <span className="absolute inset-x-4 bottom-0 border-b border-gray-100" />
                    <div className="h-4 w-8 animate-pulse rounded bg-gray-100" />
                    <div className="h-4 flex-1 animate-pulse rounded bg-gray-100" />
                    <div className="h-4 w-12 animate-pulse rounded bg-gray-100" />
                  </div>
                ))
              ) : filteredData.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-sm text-gray-300">
                  {searchQuery ? '검색 결과가 없습니다' : '등록된 공지사항이 없습니다'}
                </div>
              ) : (
                pagedData.map((notice, index) => {
                  const postNumber = filteredData.length - currentPage * 10 - index;
                  return (
                    <button
                      key={notice.id}
                      onClick={() => navigate(`/board/${notice.id}?type=notice`, { state: { notice } })}
                      className="relative flex w-full items-center gap-3 px-4 py-3 text-left active:bg-gray-50"
                    >
                      <span className="absolute inset-x-4 bottom-0 border-b border-gray-100" />
                      <span className="w-[32px] shrink-0 text-center text-sm text-gray-400">{postNumber}</span>
                      <span className="flex-1 truncate text-sm font-bold text-gray-800">{notice.title}</span>
                      <span className="w-[52px] shrink-0 text-right text-xs text-gray-400">{formatDate(notice.createdAt)}</span>
                    </button>
                  );
                })
              )}

              {/* 페이지네이션 */}
              {showPagination && (
                <div className="flex items-center justify-center gap-1.5 px-4 py-3">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="flex items-center justify-center px-1 text-gray-400 disabled:opacity-30"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  {visiblePages.map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`flex h-7 w-7 items-center justify-center rounded text-xs font-bold transition-colors ${page === currentPage ? 'bg-blue text-white' : 'text-gray-400'}`}
                    >
                      {page + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="flex items-center justify-center px-1 text-gray-400 disabled:opacity-30"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        <WriteButton onClick={() => navigate('/board/notice')} />
      </div>
    </>
  );
};

export default NoticeListPage;
