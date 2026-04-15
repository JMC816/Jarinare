import { auth, db } from '@/shared/firebase/firebase';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';

export const useDeletePost = () => {
  const deletePost = async (postPath: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const parts = postPath.split('/');
    if (parts[1] !== uid) return;

    const category = parts[2]; // 'notice' | 'event' | 'board'
    const docId = parts[3];

    try {
      // 1. 게시물 삭제
      await deleteDoc(doc(db, parts[0], parts[1], category, docId));

      // 2. 좋아요 카운트 삭제
      const likesCollection =
        category === 'notice'
          ? 'noticeLikes'
          : category === 'event'
            ? 'eventLikes'
            : 'boardLikes';
      await deleteDoc(doc(db, likesCollection, docId));

      // 3. 본인 좋아요 상태 삭제
      const votesCollection =
        category === 'notice'
          ? 'noticeVotes'
          : category === 'event'
            ? 'eventVotes'
            : 'boardVotes';
      await deleteDoc(doc(db, 'isLiked', uid, votesCollection, docId));

      // 4. board 전용: 댓글/대댓글, 조회수 삭제
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

      // 5. event 전용: 조회수 삭제
      if (category === 'event') {
        await deleteDoc(doc(db, 'boardViews', docId));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return { deletePost };
};
