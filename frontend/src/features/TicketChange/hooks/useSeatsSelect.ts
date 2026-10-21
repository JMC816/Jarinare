/**
 * @role: features/hooks
 * @rule: 좌석 변경 페이지의 좌석 선택·선점 핸들러만 담당. 백엔드 holds API 사용
 */
import { seatsStateStore } from '../models/seatsStateStore';
import { seatsChangeInfoStore } from '../models/seatsChangeInfoStore';
import { seatsChangeTargetStore } from '../models/seatsChangeTargetStore';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import { useMixSeats } from './useMixSeats';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SeatType } from '@/entities/Seat/types/seatType';
import { holdSeats, releaseHolds } from '@/features/TicketReserve/api/reservationApi';

export const useSeatsSelect = () => {
  const { seatsState, setSeatsState } = seatsStateStore();
  const { seatsChangeInfo } = seatsChangeInfoStore();
  const { seatsChangeTarget, setSeatsChangeTarget, setIsSeatsChangeTarget } = seatsChangeTargetStore();
  const { trainNo } = trainDataStore();
  const { seatsChangeMixTargetOrAllTarget } = useMixSeats();

  const [isLocksLoaded, setIsLocksLoaded] = useState(false);
  const [seatError, setSeatError] = useState<string | null>(null);
  const isSelectingRef = useRef<Record<string, boolean>>({});

  const location = useLocation();
  const mySeats: SeatType[] = location.state;
  const tripId = mySeats?.[0]?.tripId;
  const carNo = Number(trainNo) || 1;

  const selectedCount = Object.values(seatsState).filter(Boolean).length;

  // 백엔드 holds가 lock 역할을 하므로 초기 로드 즉시 완료
  useEffect(() => {
    setIsLocksLoaded(true);
  }, []);

  // 페이지 벗어날 때 선점 해제
  useEffect(() => {
    return () => {
      if (!tripId) return;
      const held = Object.keys(seatsState).filter((id) => seatsState[id]);
      if (held.length > 0) {
        releaseHolds(tripId, carNo, held).catch(() => {});
      }
    };
  }, []);

  const lockSeat = async (seatId: string): Promise<boolean> => {
    if (!tripId) return false;
    try {
      await holdSeats(tripId, carNo, [seatId]);
      setSeatError(null);
      return true;
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setSeatError(msg ?? null);
      return false;
    }
  };

  const unlockSeat = async (seatId: string) => {
    if (!tripId) return;
    await releaseHolds(tripId, carNo, [seatId]).catch(() => {});
  };

  const handleSeatsSelect = async (id: string) => {
    if (!mySeats) return;

    if (isSelectingRef.current[id]) return;
    isSelectingRef.current[id] = true;

    try {
      const eachSeat = seatsChangeInfo.filter(
        (item) => item.seatId === id && item.trainNoId === trainNo,
      );

      if (eachSeat.length > 0) {
        if (eachSeat[0].userId === 'me') return;

        // 이미 타깃인 좌석 재클릭 → 해제 (토글)
        if (seatsChangeTarget.some((t) => t.seatId === id)) {
          setSeatsChangeTarget([]);
          setIsSeatsChangeTarget(false);
          return;
        }

        // 상대방 좌석: 변경 타깃으로 지정
        setSeatsChangeTarget([eachSeat[0]]);
        setIsSeatsChangeTarget(mySeats.length === 1);
        return;
      }

      const isMineOrOthers = seatsChangeInfo.some(
        (item) => item.trainNoId === trainNo && item.seatId === id,
      );
      if (isMineOrOthers) return;

      const isSelected = seatsState[id] === true;

      if (
        selectedCount === mySeats.length ||
        mySeats.length === seatsChangeMixTargetOrAllTarget.length
      ) {
        if (isSelected) {
          setSeatsState({ ...seatsState, [id]: false });
          await unlockSeat(id);
        }
        return;
      }

      if (isSelected) {
        setSeatsState({ ...seatsState, [id]: false });
        await unlockSeat(id);
        return;
      }

      const lockSuccess = await lockSeat(id);
      if (lockSuccess) {
        setSeatsState({ ...seatsState, [id]: true });
      }
    } finally {
      isSelectingRef.current[id] = false;
    }
  };

  return { handleSeatsSelect, locks: {}, isLocksLoaded, seatError };
};
