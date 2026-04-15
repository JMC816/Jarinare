import { Comment } from '@/entities/Board/types/commentType';
import { useComments } from '@/features/Board/hooks/useComments';
import { useCreateComment } from '@/features/Board/hooks/useCreateComment';
import { useDeleteComment } from '@/features/Board/hooks/useDeleteComment';
import { useUpdateComment } from '@/features/Board/hooks/useUpdateComment';
import { auth } from '@/shared/firebase/firebase';
import { formatBoardTime } from '@/shared/lib/formatDate';
import { useRef, useState } from 'react';

interface Props {
  postDocId: string;
}

const Avatar = ({ name }: { name: string }) => (
  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-300">
    <span className="text-xs font-bold text-white">
      {name?.charAt(0) ?? '?'}
    </span>
  </div>
);

const CommentItem = ({
  comment,
  allComments,
  postDocId,
}: {
  comment: Comment;
  allComments: Comment[];
  postDocId: string;
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

          <button
            onClick={() => setShowReplyInput((v) => !v)}
            className="mt-1 text-xs font-semibold text-gray-400"
          >
            답글 달기
          </button>
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

export const CommentSection = ({ postDocId }: Props) => {
  const { comments } = useComments(postDocId);
  const { createComment } = useCreateComment(postDocId);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);

  const topLevelComments = comments.filter((c) => c.parentId === null);

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
      <div className="border-t border-gray-200 bg-white px-4 py-3">
        <span className="text-sm font-bold text-gray-900">
          댓글 {topLevelComments.length}
        </span>
      </div>

      {/* 댓글 목록 */}
      <div className="bg-white pb-[140px]">
        {topLevelComments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <span className="text-2xl">💬</span>
            <span className="mt-2 text-sm font-semibold">
              첫 댓글을 남겨보세요
            </span>
          </div>
        ) : (
          topLevelComments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-50">
              <CommentItem
                comment={comment}
                allComments={comments}
                postDocId={postDocId}
              />
            </div>
          ))
        )}
      </div>

      {/* 댓글 입력 — NavBar(80px) 위에 위치 */}
      <div className="fixed bottom-20 left-1/2 flex w-[375px] -translate-x-1/2 items-center gap-3 border-t border-gray-200 bg-white px-4 py-3">
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
          className="flex-1 rounded-xl bg-gray-100 px-4 py-2.5 text-sm outline-none"
        />
        <button
          onClick={handleSubmit}
          className="shrink-0 text-sm font-bold text-blue disabled:opacity-40"
          disabled={!input.trim()}
        >
          등록
        </button>
      </div>
    </div>
  );
};
