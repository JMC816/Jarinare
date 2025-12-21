import { auth, realtimeDb } from '@/shared/firebase/firebase';
import { seatsStateStore } from '../models/seatsStateStore';
import { useSeatsGroupInfo } from '@/features/TicketChange/hooks/useSeatsGroupInfo';
import { seatsChangeInfoStore } from '../models/seatsChangeInfoStore';
import { seatsChangeTargetStore } from '../models/seatsChangeTargetStore';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import { useMixSeats } from './useMixSeats';
import { useEffect, useRef, useState } from 'react';
import {
  DataSnapshot,
  off,
  onDisconnect,
  onValue,
  ref,
  remove,
  set,
} from 'firebase/database';
import { useLocation } from 'react-router-dom';
import { SeatType } from '@/entities/Seat/types/seatType';
import { SeatLockType } from '@/entities/Seat/types/seatLockType';

export const useSeatsSelect = () => {
  const { seatsState, setSeatsState } = seatsStateStore();
  const { groupedArray } = useSeatsGroupInfo() || {};
  const { seatsChangeInfo } = seatsChangeInfoStore();
  const { setSeatsChangeTarget, setIsSeatsChangeTarget } =
    seatsChangeTargetStore();
  const { trainNo } = trainDataStore();
  const { seatsChangeMixTargetOrAllTarget } = useMixSeats();

  const [locks, setLocks] = useState<Record<string, SeatLockType>>({});

  // 잠긴 좌석의 초기 렌더링 상태
  const [isLocksLoaded, setIsLocksLoaded] = useState(false);

  // 좌석 중복 클릭 방지
  const isSelectingRef = useRef<Record<string, boolean>>({});

  const location = useLocation();
  const mySeats: SeatType[] = location.state;

  const user = auth.currentUser;

  const selectedCount = Object.values(seatsState).filter(Boolean).length;

  // 실시간 상대방 좌석 잠금
  useEffect(() => {
    const path = `locks/${mySeats[0].id}/${trainNo}`;
    const dbRef = ref(realtimeDb, path);

    const cb = async (snapshot: DataSnapshot) => {
      const seats = (snapshot.val() as Record<string, SeatLockType>) || {};

      // 상대방이 선택한 좌석
      const othersOnly = Object.fromEntries(
        Object.entries(seats).filter(([, seat]) => seat.userId !== user?.uid),
      );

      setLocks(othersOnly);
      setIsLocksLoaded(true);
    };

    onValue(dbRef, cb);
    return () => {
      // 실시간 DB는 off로 직접 해제
      off(dbRef, 'value', cb);

      // 페이지 벗어나면 좌석 잠금 해제
      (async () => {
        Object.keys(seatsState)
          .filter((id) => seatsState[id] === true)
          .forEach(async (id) => {
            const seatLockRef = ref(
              realtimeDb,
              `locks/${mySeats[0].id}/${trainNo}/${id}`,
            );
            await remove(seatLockRef);
          });
      })();
    };
  }, [realtimeDb, mySeats[0].id, trainNo, seatsState]);

  // 좌석 잠금
  const lockSeat = async (seatId: string) => {
    if (!user) return;
    const seatLockRef = ref(
      realtimeDb,
      `locks/${mySeats[0].id}/${trainNo}/${seatId}`,
    );
    await set(seatLockRef, {
      userId: user.uid,
      mySeats,
      trainNo,
    });

    // 브라우저가 닫히면 자동 해제
    onDisconnect(seatLockRef).remove();
  };

  // 좌석 잠금 해제
  const unlockSeat = async (seatId: string) => {
    const seatLockRef = ref(
      realtimeDb,
      `locks/${mySeats[0].id}/${trainNo}/${seatId}`,
    );
    await remove(seatLockRef);
  };

  const handleSeatsSelect = async (id: string) => {
    if (!user) return;

    if (isSelectingRef.current[id]) return;
    isSelectingRef.current[id] = true;

    try {
      // 변경할려는 좌석의 수와 동일하거나 그보다 적은 타 좌석
      const filteredGroupSeats = groupedArray.filter(
        (item) => item.length <= mySeats.length,
      );

      // 선택한 각 좌석
      const eachSeat = seatsChangeInfo.filter((item) => item.seatId === id);

      // 선택한 좌석이 동일한 생성 시간인 좌석들
      const selectedGroupSeatsByTime = filteredGroupSeats
        .flat()
        .filter((item) => {
          const isTarget = eachSeat[0]?.createAt ?? 0;
          return item.createAt === isTarget;
        });

      // 내 좌석이지만 다른 승차권인 좌석
      const mySeatsNotInThisTicket = seatsChangeInfo
        .filter((item) => item.userId === user?.uid)
        .filter((item) => mySeats[0].createAt !== item.createAt);

      // 현재 사용자의 좌석들이지만 해당 승차권의 좌석이 아닌 좌석이 하나라도 있으면 선택 금지
      if (
        selectedGroupSeatsByTime.filter((item) =>
          mySeatsNotInThisTicket.includes(item),
        ).length > 0
      ) {
        return;
      }
      setSeatsChangeTarget(selectedGroupSeatsByTime);

      // 선택한 좌석과 내 좌석의 개수가 동일하면 true 그렇지 않으면 false
      if (selectedGroupSeatsByTime.length === mySeats.length) {
        setIsSeatsChangeTarget(true);
        return;
      }
      setIsSeatsChangeTarget(false);

      // 선택할려는 좌석이 이미 예매된 좌석(본인 포함)이거나
      // 잠긴 좌석(상대방)이면 선택 불가
      const isMineOrOthers = seatsChangeInfo.some(
        (item) => item.trainNoId === trainNo && item.seatId === id,
      );
      const isLockedByOther = !!locks[id];
      if (isMineOrOthers || isLockedByOther) return;

      const isSelected = seatsState[id] === true;

      // 선택한 좌석과 각 티켓의 예매된 좌석 수가 동일하거나 또는 내 예매 좌석과 (빈 좌석 + 상대방 좌석)의 개수가 동일하면 더 이상 선택이 안되지만,
      // 선택된 좌석을 다시 선택하면 빈 좌석으로 바뀐다.
      if (
        selectedCount === mySeats.length ||
        mySeats.length === seatsChangeMixTargetOrAllTarget.length
      ) {
        if (isSelected) {
          setSeatsState({ ...seatsState, [id]: false });
          await unlockSeat(id);
          return;
        }
        return;
      }

      // 선택한 좌석을 다시 선택하면 빈 좌석으로 바뀐다.
      if (isSelected) {
        setSeatsState({ ...seatsState, [id]: false });
        await unlockSeat(id);
        return;
      }
      // 빈 좌석을 선택하면 선택한 좌석으로 바뀐다.
      setSeatsState({ ...seatsState, [id]: true });
      // 선택한 후 잠금
      await lockSeat(id);
    } finally {
      // 빈 좌석으로 바뀌면 해제
      isSelectingRef.current[id] = false;
    }
  };
  return { handleSeatsSelect, locks, isLocksLoaded };
};
