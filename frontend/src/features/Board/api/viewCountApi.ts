/**
 * @role: features/api — 게시물 조회수 증가·구독
 * @rule: Firestore 외부 데이터 호출만 담당
 */
import { db } from '@/shared/firebase/firebase';
import {
  doc,
  getDoc,
  increment,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

export const incrementViewCountApi = async (
  postDocId: string,
): Promise<void> => {
  const ref = doc(db, 'boardViews', postDocId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, { count: increment(1) });
  } else {
    await setDoc(ref, { count: 1 });
  }
};

export const subscribeViewCountApi = (
  postDocId: string,
  onCount: (count: number) => void,
): (() => void) => {
  const ref = doc(db, 'boardViews', postDocId);
  return onSnapshot(ref, (snap) => {
    onCount(snap.data()?.count ?? 0);
  });
};
