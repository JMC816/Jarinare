/**
 * @role: features/api — 게시물 삭제 (board·notice·event 통합)
 * @rule: Firestore 외부 데이터 호출만 담당
 */
import { db } from '@/shared/firebase/firebase';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';

export const deletePostApi = async (
  uid: string,
  postPath: string,
): Promise<void> => {
  const parts = postPath.split('/');
  if (parts[1] !== uid) return;

  const category = parts[2];
  const docId = parts[3];

  await deleteDoc(doc(db, parts[0], parts[1], category, docId));

  const likesCollection =
    category === 'notice'
      ? 'noticeLikes'
      : category === 'event'
        ? 'eventLikes'
        : 'boardLikes';
  await deleteDoc(doc(db, likesCollection, docId));

  const votesCollection =
    category === 'notice'
      ? 'noticeVotes'
      : category === 'event'
        ? 'eventVotes'
        : 'boardVotes';
  await deleteDoc(doc(db, 'isLiked', uid, votesCollection, docId));

  if (category === 'board') {
    const commentsSnap = await getDocs(
      collection(db, 'boardComments', docId, 'items'),
    );
    await Promise.all(
      commentsSnap.docs.map((d) =>
        deleteDoc(doc(db, 'boardComments', docId, 'items', d.id)),
      ),
    );
    await deleteDoc(doc(db, 'boardViews', docId));
  }

  if (category === 'event') {
    await deleteDoc(doc(db, 'boardViews', docId));
  }
};
