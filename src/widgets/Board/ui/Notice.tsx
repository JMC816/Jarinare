import { BoardPost } from '@/entities/Board/types/boardType';
import { useDeletePost } from '@/features/Board/hooks/useDeletePost';
import { useLikeNoitce } from '@/features/Board/hooks/useLikeNotice';
import { useNoticePageNation } from '@/features/Board/hooks/useNoticePagination';
import { useUpdatePost } from '@/features/Board/hooks/useUpdatePost';
import { auth } from '@/shared/firebase/firebase';
import { formatBoardTime } from '@/shared/lib/formatDate';
import { useState } from 'react';
import { NoticeSkeleton } from './NoticeSkeleton';
import { PostEditModal } from './PostEditModal';

type SortOrder = 'newest' | 'oldest';

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'newest', label: '최신순' },
  { value: 'oldest', label: '오래된순' },
];

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

const NoticeImage = ({ src, alt }: { src: string; alt: string }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="w-full">
      <img
        src={src}
        alt={alt}
        className={`w-full object-contain transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
};

const HamburgerIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
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

export const Notice = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [filterOpen, setFilterOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<BoardPost | null>(null);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [updatedItems, setUpdatedItems] = useState<
    Record<string, Partial<BoardPost>>
  >({});

  const { ref, items, isFetching } = useNoticePageNation(
    searchQuery,
    sortOrder,
  );
  const { likedMap, likesMap, handleClickLike } = useLikeNoitce(items);
  const { deletePost } = useDeletePost();
  const { updatePost } = useUpdatePost();

  const currentUid = auth.currentUser?.uid;

  const displayedItems = items
    .filter((p) => !deletedIds.has(p.id))
    .map((p) => ({ ...p, ...updatedItems[p.id] }) as BoardPost);

  const handleDelete = async (post: BoardPost) => {
    await deletePost(post.id);
    setDeletedIds((prev) => new Set(prev).add(post.id));
    setMenuOpenId(null);
  };

  const handleUpdate = async (title: string, content: string) => {
    if (!editingPost) return;
    await updatePost(editingPost.id, { title, content });
    setUpdatedItems((prev) => ({
      ...prev,
      [editingPost.id]: { title, content },
    }));
    setEditingPost(null);
  };

  const currentLabel = SORT_OPTIONS.find((o) => o.value === sortOrder)?.label;

  return (
    <div className="mb-[100px]">
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
      <div className="mt-3 space-y-3 px-4">
        {items.length === 0 && isFetching ? (
          [...Array(3)].map((_, idx) => <NoticeSkeleton key={idx} />)
        ) : displayedItems.length === 0 ? (
          <div className="flex h-[200px] w-full flex-col items-center justify-center gap-2">
            <span className="text-2xl">📭</span>
            <span className="text-sm font-semibold text-gray-400">
              {searchQuery
                ? '검색 결과가 없습니다'
                : '등록된 공지사항이 없습니다'}
            </span>
          </div>
        ) : (
          displayedItems.map((notice) => {
            const isLiked = likedMap[notice.id] ?? false;
            const likesCount = likesMap[notice.id] ?? notice.likes;
            const isOwner = currentUid === notice.id.split('/')[1];

            return (
              <div
                key={notice.id}
                className="relative rounded-xl bg-white shadow-sm"
              >
                <div className="flex items-center gap-x-4 px-4 py-3">
                  <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-lg bg-gray-300">
                    <span className="text-sm font-bold text-white">관</span>
                  </div>
                  <div className="flex flex-1 flex-col gap-y-[2px]">
                    <span className="text-base font-bold text-black">
                      관리자
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatBoardTime(notice.createdAt)}
                    </span>
                  </div>
                  <div className="bg-red-500 rounded px-2 py-0.5 text-xs font-bold text-white">
                    공지
                  </div>
                  {isOwner && (
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(
                            menuOpenId === notice.id ? null : notice.id,
                          );
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
                      >
                        <HamburgerIcon />
                      </button>
                      {menuOpenId === notice.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setMenuOpenId(null)}
                          />
                          <div className="absolute right-0 top-8 z-20 min-w-[80px] overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingPost({ ...notice });
                                setMenuOpenId(null);
                              }}
                              className="block w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50"
                            >
                              수정
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(notice);
                              }}
                              className="text-red-500 hover:bg-red-50 block w-full px-4 py-2.5 text-left text-sm"
                            >
                              삭제
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {notice.imageUrl && (
                  <NoticeImage src={notice.imageUrl} alt={notice.title} />
                )}

                <div className="flex items-center gap-3 px-4 pb-1 pt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClickLike(notice.id);
                    }}
                    className={`flex items-center justify-center rounded-full p-1.5 text-xl transition-all duration-150 ${
                      isLiked ? 'text-red-500' : 'text-gray-400'
                    }`}
                  >
                    {isLiked ? '❤️' : '🤍'}
                  </button>
                  <span className="text-sm font-semibold">
                    {likesCount}명이 좋아합니다
                  </span>
                </div>
                <div className="px-4 pb-2 text-sm">
                  <span className="mr-2 font-semibold">{notice.author}</span>
                  {notice.title}
                </div>
                <div className="px-4 pb-2 text-sm text-gray-800">
                  {notice.content}
                </div>
              </div>
            );
          })
        )}

        <div ref={ref} className="h-10" />
      </div>

      {editingPost && (
        <PostEditModal
          post={editingPost}
          onSave={handleUpdate}
          onClose={() => setEditingPost(null)}
        />
      )}

    </div>
  );
};
