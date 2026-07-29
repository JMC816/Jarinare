/**
 * @role: features/api — 댓글·대댓글 삭제
 * @rule: Firestore 외부 데이터 호출만 담당
 */
import { db } from '@/shared/firebase/firebase';
import { Comment } from '@/entities/Board/types/commentType';
import { deleteDoc, doc } from 'firebase/firestore';

export const deleteCommentApi = async (
  postDocId: string,
  commentId: string,
  allComments: Comment[],
): Promise<void> => {
  const replies = allComments.filter((c) => c.parentId === commentId);
  await Promise.all(
    replies.map((r) =>
      deleteDoc(doc(db, 'boardComments', postDocId, 'items', r.id)),
    ),
  );
  await deleteDoc(doc(db, 'boardComments', postDocId, 'items', commentId));
};

export const deleteReplyApi = async (
  postDocId: string,
  replyId: string,
): Promise<void> => {
  await deleteDoc(doc(db, 'boardComments', postDocId, 'items', replyId));
};
