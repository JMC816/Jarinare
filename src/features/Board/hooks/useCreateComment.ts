/**
 * @role: features — 댓글 생성 훅
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { auth } from '@/shared/firebase/firebase';
import { createCommentApi } from '../api/createCommentApi';

export const useCreateComment = (postDocId: string) => {
  const createComment = async (
    content: string,
    parentId: string | null = null,
  ) => {
    const user = auth.currentUser;
    if (!user || !content.trim()) return;
    await createCommentApi(
      postDocId,
      user.uid,
      user.displayName ?? user.email ?? '익명',
      content,
      parentId,
    );
  };

  return { createComment };
};
