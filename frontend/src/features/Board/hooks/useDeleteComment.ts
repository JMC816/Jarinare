/**
 * @role: features — 댓글·대댓글 삭제 훅
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { Comment } from '@/entities/Board/types/commentType';
import { auth } from '@/shared/firebase/firebase';
import { deleteCommentApi, deleteReplyApi } from '../api/deleteCommentApi';

export const useDeleteComment = (postDocId: string) => {
  const deleteComment = async (commentId: string, allComments: Comment[]) => {
    if (!auth.currentUser) return;
    await deleteCommentApi(postDocId, commentId, allComments);
  };

  const deleteReply = async (replyId: string) => {
    if (!auth.currentUser) return;
    await deleteReplyApi(postDocId, replyId);
  };

  return { deleteComment, deleteReply };
};
