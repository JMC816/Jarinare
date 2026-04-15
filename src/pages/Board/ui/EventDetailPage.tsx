import backward from '@/assets/icons/backward.png';
import { BoardPost } from '@/entities/Board/types/boardType';
import { useDeletePost } from '@/features/Board/hooks/useDeletePost';
import { useLikeEvent } from '@/features/Board/hooks/useLikeEvent';
import { useUpdatePost } from '@/features/Board/hooks/useUpdatePost';
import { auth } from '@/shared/firebase/firebase';
import { formatBoardTime } from '@/shared/lib/formatDate';
import { PostEditModal } from '@/widgets/Board/ui/PostEditModal';
import { useViewCount } from '@/features/Board/hooks/useViewCount';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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
  const event = location.state?.event as BoardPost | undefined;

  const [menuOpen, setMenuOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BoardPost | null>(null);
  const [localPost, setLocalPost] = useState<BoardPost | null>(null);

  const post = localPost ?? event;
  const postDocId = post?.id.split('/').pop() ?? '';

  const eventItems = useMemo(() => (post ? [post] : []), [post?.id]);
  const { likedMap, likesMap, handleClickLike } = useLikeEvent(eventItems);
  const { deletePost } = useDeletePost();
  const { updatePost } = useUpdatePost();
  const { viewCount } = useViewCount(postDocId);

  if (!post) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>게시글을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const isLiked = likedMap[post.id] ?? false;
  const likesCount = likesMap[post.id] ?? post.likes ?? 0;
  const currentUid = auth.currentUser?.uid;
  const isOwner = currentUid === post.id.split('/')[1];

  const handleDelete = async () => {
    await deletePost(post.id);
    navigate(-1);
  };

  const handleUpdate = async (title: string, content: string) => {
    await updatePost(post.id, { title, content });
    setLocalPost({ ...post, title, content });
    setEditingPost(null);
  };

  return (
    <div className="flex h-screen w-full flex-col">
      {/* 헤더 */}
      <div className="flex w-full items-center justify-between border-b border-gray-200 bg-white px-4 py-4 pl-[28px] pr-[27px]">
        <img
          onClick={() => navigate(-1)}
          src={backward}
          className="h-[20px] w-[12px] cursor-pointer"
        />
        <h1 className="text-lg font-bold">이벤트</h1>
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
                      setEditingPost({ ...post });
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
                src={post.imageUrl}
                alt={post.title}
                className="w-full object-contain"
              />
            </div>
          )}

          {/* 좋아요 + 조회수 */}
          <div className="flex items-center justify-between px-4 pb-1 pt-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleClickLike(post.id)}
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
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <span>조회수</span>
              <span>{viewCount}</span>
            </div>
          </div>

          {/* 제목 & 내용 */}
          <div className="px-4 pb-2 text-sm">
            <span className="mr-2 font-semibold">{post.author}</span>
            {post.title}
          </div>
          <div className="px-4 pb-4 text-sm text-gray-800">{post.content}</div>
        </div>
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

export default EventDetailPage;
