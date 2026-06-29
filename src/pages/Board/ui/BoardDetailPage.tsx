import backward from '@/assets/icons/backward.png';
import { BoardPost } from '@/entities/Board/types/boardType';
import { useDeletePost } from '@/features/Board/hooks/useDeletePost';
import { useLikeBoard } from '@/features/Board/hooks/useLikeBoard';
import { useUpdatePost } from '@/features/Board/hooks/useUpdatePost';
import { useViewCount } from '@/features/Board/hooks/useViewCount';
import { auth } from '@/shared/firebase/firebase';
import { formatBoardTime } from '@/shared/lib/formatDate';
import { CommentSection } from '@/widgets/Board/ui/CommentSection';
import { PostEditModal } from '@/widgets/Board/ui/PostEditModal';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PCBoardDetailPage from './PCBoardDetailPage';

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

const BoardDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const post = location.state?.post as BoardPost | undefined;

  const [menuOpen, setMenuOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BoardPost | null>(null);
  const [localPost, setLocalPost] = useState<BoardPost | null>(null);

  const currentPost = localPost ?? post;
  const postDocId = currentPost?.id.split('/').pop() ?? '';

  const postItems = useMemo(
    () => (currentPost ? [currentPost] : []),
    [currentPost?.id],
  );
  const { likedMap, likesMap, handleClickLike } = useLikeBoard(postItems);
  const { deletePost } = useDeletePost();
  const { updatePost } = useUpdatePost();
  const { viewCount } = useViewCount(postDocId);

  if (!currentPost) {
    return (
      <>
        <div className="hidden w-full lg:block">
          <PCBoardDetailPage />
        </div>
        <div className="flex h-screen w-full items-center justify-center lg:hidden">
          <p>게시글을 찾을 수 없습니다.</p>
        </div>
      </>
    );
  }

  const isLiked = likedMap[currentPost.id] ?? false;
  const likesCount = likesMap[currentPost.id] ?? currentPost.likes ?? 0;
  const currentUid = auth.currentUser?.uid;
  const isOwner = currentUid === currentPost.id.split('/')[1];

  const handleDelete = async () => {
    await deletePost(currentPost.id);
    navigate(-1);
  };

  const handleUpdate = async (title: string, content: string) => {
    await updatePost(currentPost.id, { title, content });
    setLocalPost({ ...currentPost, title, content });
    setEditingPost(null);
  };

  return (
    <>
      <div className="hidden w-full lg:block">
        <PCBoardDetailPage />
      </div>
      <div className="flex h-screen w-full flex-col lg:hidden">
        {/* 헤더 */}
        <div className="flex w-full items-center justify-between border-b border-gray-200 bg-white px-4 py-4 pl-[28px] pr-[27px]">
          <img
            onClick={() => navigate(-1)}
            src={backward}
            className="h-[20px] w-[12px] cursor-pointer"
          />
          <h1 className="text-lg font-bold">자유게시판</h1>
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
                        setEditingPost({ ...currentPost });
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

        {/* 게시글 내용 + 댓글 */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="bg-white">
            {/* 작성자 정보 */}
            <div className="flex items-center gap-3 px-4 pb-2 pt-4">
              <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-lg bg-gray-300">
                <span className="text-sm font-bold text-white">
                  {currentPost.author?.charAt(0) ?? '?'}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-y-[2px]">
                <span className="text-base font-bold text-black">
                  {currentPost.author}
                </span>
                <span className="text-xs text-gray-400">
                  {formatBoardTime(currentPost.createdAt)}
                </span>
              </div>
              <div className="bg-blue-500 rounded px-2 py-0.5 text-xs font-bold text-white">
                자유
              </div>
            </div>

            {/* 이미지 */}
            {currentPost.imageUrl && (
              <div className="w-full">
                <img
                  src={currentPost.imageUrl}
                  alt={currentPost.title}
                  className="w-full object-contain"
                />
              </div>
            )}

            {/* 제목 */}
            <div className="px-4 pt-3 text-base font-bold text-gray-900">
              {currentPost.title}
            </div>

            {/* 내용 */}
            <div className="px-4 py-3 text-sm leading-relaxed text-gray-800">
              {currentPost.content}
            </div>

            {/* 좋아요 + 조회수 */}
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleClickLike(currentPost.id)}
                  className="transition-transform duration-150 active:scale-90"
                >
                  <span className="text-2xl">{isLiked ? '❤️' : '🤍'}</span>
                </button>
                <span className="text-sm font-semibold text-gray-700">
                  {likesCount}명이 좋아합니다
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <span>조회수</span>
                <span>{viewCount}</span>
              </div>
            </div>
          </div>

          {/* 댓글 */}
          <CommentSection postDocId={postDocId} />
        </div>

        {editingPost && (
          <PostEditModal
            post={editingPost}
            onSave={handleUpdate}
            onClose={() => setEditingPost(null)}
          />
        )}
      </div>
    </>
  );
};

export default BoardDetailPage;
