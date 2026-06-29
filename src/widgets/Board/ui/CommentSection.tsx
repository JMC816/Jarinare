import { Comment } from '@/entities/Board/types/commentType';
import { useComments } from '@/features/Board/hooks/useComments';
import { useCreateComment } from '@/features/Board/hooks/useCreateComment';
import { useDeleteComment } from '@/features/Board/hooks/useDeleteComment';
import { useUpdateComment } from '@/features/Board/hooks/useUpdateComment';
import { useLikeComment } from '@/features/Board/hooks/useLikeComment';
import { auth } from '@/shared/firebase/firebase';
import { formatBoardTime } from '@/shared/lib/formatDate';
import { getProfileColor } from '@/shared/lib/profileColor';
import { useRef, useState } from 'react';

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

interface Props {
  postDocId: string;
  isPC?: boolean;
}

const Avatar = ({ name }: { name: string }) => (
  <div
    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
    style={{ backgroundColor: getProfileColor(name) }}
  >
    {name?.charAt(0) ?? '?'}
  </div>
);

const CommentItem = ({
  comment,
  allComments,
  postDocId,
  isLiked,
  likesCount,
  onLike,
}: {
  comment: Comment;
  allComments: Comment[];
  postDocId: string;
  isLiked: boolean;
  likesCount: number;
  onLike: () => void;
}) => {
  const currentUid = auth.currentUser?.uid;
  const isOwner = currentUid === comment.uid;

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(comment.content);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyValue, setReplyValue] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const replySubmittingRef = useRef(false);

  const { updateComment } = useUpdateComment(postDocId);
  const { deleteComment } = useDeleteComment(postDocId);
  const { createComment } = useCreateComment(postDocId);

  const replies = allComments.filter((c) => c.parentId === comment.id);

  const handleEdit = async () => {
    await updateComment(comment.id, editValue);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    await deleteComment(comment.id, allComments);
  };

  const handleReplySubmit = async () => {
    if (!replyValue.trim() || replySubmittingRef.current) return;
    replySubmittingRef.current = true;
    await createComment(replyValue, comment.id);
    setReplyValue('');
    setShowReplyInput(false);
    replySubmittingRef.current = false;
  };

  return (
    <div>
      {/* 댓글 */}
      <div className="flex gap-3 px-4 py-3">
        <Avatar name={comment.author} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">
                {comment.author}
              </span>
              <span className="text-xs text-gray-400">
                {formatBoardTime(comment.createdAt)}
              </span>
            </div>
            {isOwner && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex h-6 w-6 items-center justify-center text-gray-400"
                >
                  ···
                </button>
                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-7 z-20 min-w-[80px] overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg">
                      <button
                        onClick={() => {
                          setIsEditing(true);
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
            )}
          </div>

          {isEditing ? (
            <div className="mt-1 flex gap-2">
              <input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1 rounded-lg bg-gray-100 px-3 py-1.5 text-sm outline-none"
              />
              <button
                onClick={handleEdit}
                className="text-xs font-semibold text-blue"
              >
                저장
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs font-semibold text-gray-400"
              >
                취소
              </button>
            </div>
          ) : (
            <p className="mt-0.5 text-sm text-gray-800">{comment.content}</p>
          )}

          <div className="mt-1 flex items-center gap-3">
            <button
              onClick={onLike}
              className={`flex items-center gap-1 text-xs font-semibold transition-colors ${isLiked ? 'text-blue' : 'text-gray-400 hover:text-blue'}`}
            >
              <HeartIcon filled={isLiked} />
              <span>{likesCount > 0 ? likesCount : '좋아요'}</span>
            </button>
            <button
              onClick={() => setShowReplyInput((v) => !v)}
              className="text-xs font-semibold text-gray-400 hover:text-gray-600"
            >
              답글 달기
            </button>
          </div>
        </div>
      </div>

      {/* 대댓글 목록 */}
      {replies.length > 0 && (
        <div className="ml-11 border-l-2 border-gray-100">
          {replies.map((reply) => (
            <ReplyItem key={reply.id} reply={reply} postDocId={postDocId} />
          ))}
        </div>
      )}

      {/* 대댓글 입력 */}
      {showReplyInput && (
        <div className="ml-11 flex items-center gap-2 border-l-2 border-gray-100 py-2 pl-3 pr-4">
          <Avatar name={auth.currentUser?.displayName ?? '?'} />
          <input
            value={replyValue}
            onChange={(e) => setReplyValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleReplySubmit();
              }
            }}
            placeholder="답글을 입력하세요"
            className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-sm outline-none"
          />
          <button
            onClick={handleReplySubmit}
            className="shrink-0 text-xs font-bold text-blue"
          >
            등록
          </button>
        </div>
      )}
    </div>
  );
};

const ReplyItem = ({
  reply,
  postDocId,
}: {
  reply: Comment;
  postDocId: string;
}) => {
  const currentUid = auth.currentUser?.uid;
  const isOwner = currentUid === reply.uid;

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(reply.content);
  const [menuOpen, setMenuOpen] = useState(false);

  const { updateComment } = useUpdateComment(postDocId);
  const { deleteReply } = useDeleteComment(postDocId);

  const handleEdit = async () => {
    await updateComment(reply.id, editValue);
    setIsEditing(false);
  };

  return (
    <div className="flex gap-3 py-2.5 pl-3 pr-4">
      <Avatar name={reply.author} />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900">
              {reply.author}
            </span>
            <span className="text-xs text-gray-400">
              {formatBoardTime(reply.createdAt)}
            </span>
          </div>
          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-6 w-6 items-center justify-center text-gray-400"
              >
                ···
              </button>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-7 z-20 min-w-[80px] overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setMenuOpen(false);
                      }}
                      className="block w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        deleteReply(reply.id);
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

        {isEditing ? (
          <div className="mt-1 flex gap-2">
            <input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1 rounded-lg bg-gray-100 px-3 py-1.5 text-sm outline-none"
            />
            <button
              onClick={handleEdit}
              className="text-xs font-semibold text-blue"
            >
              저장
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-xs font-semibold text-gray-400"
            >
              취소
            </button>
          </div>
        ) : (
          <p className="mt-0.5 text-sm text-gray-800">{reply.content}</p>
        )}
      </div>
    </div>
  );
};

export const CommentSection = ({ postDocId, isPC = false }: Props) => {
  const { comments } = useComments(postDocId);
  const { createComment } = useCreateComment(postDocId);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);

  const topLevelComments = comments.filter((c) => c.parentId === null);
  const { likedMap, likesMap, handleClickLike } = useLikeComment(
    topLevelComments.map((c) => c.id),
  );

  const handleSubmit = async () => {
    if (!input.trim() || submittingRef.current) return;
    submittingRef.current = true;
    await createComment(input, null);
    setInput('');
    inputRef.current?.blur();
    submittingRef.current = false;
  };

  return (
    <div className="flex flex-col">
      {/* 댓글 헤더 */}
      <div className="bg-white px-4 py-3">
        <span className="text-md font-bold text-gray-900">
          댓글 <span className="text-blue">{topLevelComments.length}</span>
        </span>
      </div>

      {/* 댓글 목록 */}
      <div className={`bg-white ${isPC ? '' : 'pb-[140px]'}`}>
        {topLevelComments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <span className="text-2xl">💬</span>
            <span className="mt-2 text-sm font-semibold">
              첫 댓글을 남겨보세요
            </span>
          </div>
        ) : (
          topLevelComments.map((comment) => (
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                allComments={comments}
                postDocId={postDocId}
                isLiked={likedMap[comment.id] ?? false}
                likesCount={likesMap[comment.id] ?? 0}
                onLike={() => handleClickLike(comment.id)}
              />
            </div>
          ))
        )}
      </div>

      {/* 댓글 입력 */}
      <div
        className={`flex items-center gap-3 bg-white px-4 py-3 ${isPC ? '' : 'fixed bottom-20 left-1/2 w-[375px] -translate-x-1/2'}`}
      >
        <Avatar name={auth.currentUser?.displayName ?? '?'} />
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="댓글을 입력하세요"
          className="flex-1 rounded-md bg-gray-100 px-4 py-2.5 text-sm outline-none"
        />
        <button
          onClick={handleSubmit}
          className="shrink-0 rounded-md bg-blue px-6 py-2 text-sm font-bold text-white disabled:opacity-40"
          disabled={!input.trim()}
        >
          등록
        </button>
      </div>
    </div>
  );
};
