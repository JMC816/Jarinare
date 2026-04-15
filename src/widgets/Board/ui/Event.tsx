import { useEventPagination } from '@/features/Board/hooks/useEventPagination';
import { formatBoardTime } from '@/shared/lib/formatDate';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type SortOrder = 'newest' | 'oldest';

const EventImage = ({
  src,
  alt,
  title,
}: {
  src: string | null;
  alt: string;
  title: string;
}) => {
  const [loaded, setLoaded] = useState(false);

  if (!src) {
    return (
      <div className="flex aspect-square w-full items-center justify-center bg-gradient-to-br from-blue to-lightBlue p-3">
        <span className="line-clamp-3 text-center text-xs font-bold text-white">
          {title}
        </span>
      </div>
    );
  }

  return (
    <div className="aspect-square w-full bg-gray-100">
      <img
        src={src}
        alt={alt}
        className={`h-full w-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
};

const FilterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="11" y1="18" x2="13" y2="18" />
  </svg>
);

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'newest', label: '최신순' },
  { value: 'oldest', label: '오래된순' },
];

export const Event = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [filterOpen, setFilterOpen] = useState(false);

  const { ref, items, isFetching } = useEventPagination(searchQuery, sortOrder);
  const navigate = useNavigate();

  const currentLabel = SORT_OPTIONS.find((o) => o.value === sortOrder)?.label;

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <div className="flex-1 overflow-y-auto">
        {/* 검색 + 필터 */}
        <div className="flex items-center gap-2 px-4 pt-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="제목, 내용, 작성자 검색"
            className="flex-1 rounded-xl bg-white px-4 py-2.5 text-sm shadow-sm outline-none placeholder:text-gray-400"
          />
          <div className="relative">
            <button
              onClick={() => setFilterOpen((v) => !v)}
              className="flex items-center gap-1 rounded-xl bg-white px-3 py-2.5 text-xs font-semibold text-gray-600 shadow-sm"
            >
              <FilterIcon />
              <span>{currentLabel}</span>
            </button>
            {filterOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setFilterOpen(false)}
                />
                <div className="absolute right-0 top-10 z-20 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg">
                  <div className="flex flex-nowrap gap-2 p-2">
                    {SORT_OPTIONS.map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => {
                          setSortOrder(value);
                          setFilterOpen(false);
                        }}
                        className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                          sortOrder === value
                            ? 'bg-blue text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 게시물 목록 */}
        <div className="p-4 pt-3">
          {items.length === 0 && isFetching ? (
            <div className="grid grid-cols-3 gap-3">
              {[...Array(6)].map((_, idx) => (
                <div
                  key={idx}
                  className="overflow-hidden rounded-lg bg-white shadow-sm"
                >
                  <div className="aspect-square w-full animate-pulse bg-gray-200" />
                  <div className="space-y-1.5 p-2">
                    <div className="h-2.5 w-3/4 animate-pulse rounded bg-gray-200" />
                    <div className="h-2 w-1/2 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-[200px] w-full flex-col items-center justify-center gap-2">
              <span className="text-2xl">📭</span>
              <span className="text-sm font-semibold text-gray-400">
                {searchQuery
                  ? '검색 결과가 없습니다'
                  : '등록된 이벤트가 없습니다'}
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {items.map((event) => {
                return (
                  <div
                    key={event.id}
                    className="cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
                    onClick={() =>
                      navigate('/board/event/detail', { state: { event } })
                    }
                  >
                    <EventImage
                      src={event.imageUrl}
                      alt={event.title}
                      title={event.title}
                    />
                    <div className="p-2">
                      <h3 className="line-clamp-1 text-xs font-bold text-gray-900">
                        {event.title}
                      </h3>
                      <div className="mt-0.5 text-xs text-gray-400">
                        {formatBoardTime(event.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div ref={ref} className="h-10" />
        </div>
      </div>
    </div>
  );
};
