/**
 * @role: features — 보낸 좌석 변경 요청 대기 여부 감지
 * @rule: 백엔드 GET /seats/change-requests?box=sent 조회만 담당
 */
import { backendClient } from '@/shared/api/backendClient';
import { useEffect, useRef, useState } from 'react';

interface SentRequest {
  requestId: number;
  status: string;
  expiresAt: string;
}

export const useSeatsChangeBlocked = () => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const { data } = await backendClient.get<SentRequest[]>(
          '/api/seats/change-requests',
          { params: { box: 'sent' } },
        );
        const pending = data.find((r) => r.status === 'PENDING') ?? null;

        if (pending) {
          setIsBlocked(true);
          const tick = () => {
            const left = Math.max(
              0,
              Math.ceil((new Date(pending.expiresAt).getTime() - Date.now()) / 1000),
            );
            setRemaining(left);
            if (left <= 0) {
              clearInterval(timerRef.current!);
              setIsBlocked(false);
              setRemaining(null);
            }
          };
          tick();
          timerRef.current = setInterval(tick, 1000);
        } else {
          setIsBlocked(false);
          setRemaining(null);
        }
      } catch {
        setIsBlocked(false);
        setRemaining(null);
      }
    };

    void check();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return { isBlocked, remaining };
};
