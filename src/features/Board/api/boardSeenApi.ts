/**
 * @role: features/api — 게시판 마지막 방문 시각 조회·갱신
 * @rule: Firestore 외부 데이터 호출만 담당
 */
import { db } from '@/shared/firebase/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface SeenData {
  notice: number;
  event: number;
  board: number;
}

export const getBoardSeenApi = async (
  uid: string,
): Promise<SeenData | null> => {
  const snap = await getDoc(doc(db, 'boardSeen', uid));
  return snap.exists() ? (snap.data() as SeenData) : null;
};

export const updateBoardSeenApi = async (
  uid: string,
  category: 'notice' | 'event' | 'board',
  now: number,
): Promise<void> => {
  const ref = doc(db, 'boardSeen', uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, { [category]: now });
  } else {
    await setDoc(ref, { notice: 0, event: 0, board: 0, [category]: now });
  }
};
