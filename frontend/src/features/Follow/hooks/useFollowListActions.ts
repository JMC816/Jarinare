/**
 * @role: features — 팔로워/팔로잉 목록에서 삭제 액션
 * @rule: Firestore 쓰기만 담당, UI 포함 금지
 */
import { auth, db } from '@/shared/firebase/firebase';
import { deleteDoc, doc, setDoc, increment } from 'firebase/firestore';

export const useFollowListActions = () => {
  const myUid = auth.currentUser?.uid;

  // 내 팔로워 삭제 (상대방이 나를 팔로우하는 관계 제거)
  const removeFollower = async (followerUid: string) => {
    if (!myUid) return;
    await Promise.all([
      deleteDoc(doc(db, 'follows', myUid, 'followers', followerUid)),
      deleteDoc(doc(db, 'follows', followerUid, 'following', myUid)),
      setDoc(
        doc(db, 'followerCounts', myUid),
        { count: increment(-1) },
        { merge: true },
      ),
    ]);
  };

  // 내 팔로잉 삭제 (내가 상대방을 팔로우하는 관계 제거)
  const removeFollowing = async (targetUid: string) => {
    if (!myUid) return;
    await Promise.all([
      deleteDoc(doc(db, 'follows', myUid, 'following', targetUid)),
      deleteDoc(doc(db, 'follows', targetUid, 'followers', myUid)),
      setDoc(
        doc(db, 'followerCounts', targetUid),
        { count: increment(-1) },
        { merge: true },
      ),
    ]);
  };

  return { removeFollower, removeFollowing };
};
