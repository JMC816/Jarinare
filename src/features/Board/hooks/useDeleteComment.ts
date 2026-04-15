import { Comment } from '@/entities/Board/types/commentType';
import { auth, db } from '@/shared/firebase/firebase';
import { deleteDoc, doc } from 'firebase/firestore';

export const useDeleteComment = (postDocId: string) => {
  const deleteComment = async (commentId: string, allComments: Comment[]) => {
    const user = auth.currentUser;
    if (!user) return;

    // 댓글 삭제 시 연결된 대댓글도 함께 삭제
    const replies = allComments.filter((c) => c.parentId === commentId);
    await Promise.all(
      replies.map((r) =>
        deleteDoc(doc(db, 'boardComments', postDocId, 'items', r.id)),
      ),
    );

    await deleteDoc(doc(db, 'boardComments', postDocId, 'items', commentId));
  };

  const deleteReply = async (replyId: string) => {
    const user = auth.currentUser;
    if (!user) return;
    await deleteDoc(doc(db, 'boardComments', postDocId, 'items', replyId));
  };

  return { deleteComment, deleteReply };
};
