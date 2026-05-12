import { auth, realtimeDb } from '@/shared/firebase/firebase';
import { ref, remove, onValue, DataSnapshot } from 'firebase/database';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SeatType } from '@/entities/Seat/types/seatType';

const TIMEOUT_MS = 60 * 1000; // 1분

// 요청자 쪽 타이머: 본인이 보낸 요청의 남은 시간 + 만료 시 자동 삭제
export const useRequestSenderTimer = () => {
  const location = useLocation();
  const mySeats: SeatType[] = location.state;
  const user = auth.currentUser;
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!user || !mySeats?.[0]) return;

    // 본인이 보낸 요청 경로: {targetUserId}_change/{key}
    // useSeatsChangeBlocked에서 isBlocked=true일 때 해당 경로를 찾아야 함
    // Realtime DB 전체를 구독해서 본인 mySeats 키가 포함된 요청을 찾음
    const rootRef = ref(realtimeDb);
    const myKey = `${mySeats[0].id}_${mySeats[0].trainNoId}_${mySeats.map((item) => item.seatId)}`;

    let intervalId: ReturnType<typeof setInterval> | null = null;
    let requestPath: string | null = null;

    const unsub = onValue(rootRef, async (snapshot: DataSnapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.val() as Record<string, unknown>;

      // 본인 요청이 담긴 경로 탐색
      for (const key of Object.keys(data)) {
        if (key === 'locks' || key.includes('refuse') || key.includes('accept'))
          continue;
        if (key === `${user.uid}_change`) continue;

        const node = data[key] as Record<string, unknown>;
        if (node && typeof node === 'object' && myKey in node) {
          const entry = node[myKey] as { createdAt?: number };
          if (!entry?.createdAt) continue;

          requestPath = `${key}/${myKey}`;
          const createdAt = entry.createdAt;

          if (intervalId) clearInterval(intervalId);

          intervalId = setInterval(() => {
            const elapsed = Date.now() - createdAt;
            const left = Math.max(0, TIMEOUT_MS - elapsed);
            setRemaining(Math.ceil(left / 1000));

            if (left <= 0) {
              clearInterval(intervalId!);
              setRemaining(0);
              if (requestPath) remove(ref(realtimeDb, requestPath));
            }
          }, 1000);

          return;
        }
      }

      // 요청이 없으면 타이머 초기화
      if (intervalId) clearInterval(intervalId);
      setRemaining(null);
    });

    return () => {
      unsub();
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return { remaining };
};

// 수신자 쪽 타이머: 특정 요청의 남은 시간 + 만료 시 자동 삭제
export const useRequestReceiverTimer = (
  createdAt: number | null | undefined,
  requestPath: string | null,
) => {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!createdAt || !requestPath) return;

    const timerRef: { current: ReturnType<typeof setInterval> | undefined } = {
      current: undefined,
    };

    const tick = () => {
      const elapsed = Date.now() - createdAt;
      const left = Math.max(0, TIMEOUT_MS - elapsed);
      setRemaining(Math.ceil(left / 1000));

      if (left <= 0) {
        clearInterval(timerRef.current);
        setRemaining(0);
        remove(ref(realtimeDb, requestPath));
      }
    };

    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [createdAt, requestPath]);

  return { remaining };
};
