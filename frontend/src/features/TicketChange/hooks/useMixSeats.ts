/**
 * @role: features/hooks
 * @rule: 혼합 좌석(점유+빈) 선택 상태 관리만 담당. RTDB 잠금 제거 — 백엔드 holds가 대체
 */
import { SeatType } from '@/entities/Seat/types/seatType';
import { useEffect, useState } from 'react';
import { seatsStateStore } from '../models/seatsStateStore';
import { useSeatsGroupInfo } from '@/features/TicketChange/hooks/useSeatsGroupInfo';
import { seatsChangeInfoStore } from '../models/seatsChangeInfoStore';
import { seatsChangeTargetStore } from '../models/seatsChangeTargetStore';
import { seatIdsStore } from '../models/seatIdsStore';
import { prevSeatsTargetStore } from '../models/prevSeatsTargetStore';
import { seatsTargetStore } from '../models/seatsTargetStore';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import { shareKeepSeatsStore } from '../models/shareKeepSeatsStore';
import { seatsChangeMixTargetSeatIdStore } from '../models/seatsChangeMixTargetSeatIdStore';
import { useLocation } from 'react-router-dom';
import { holdSeats, releaseHolds } from '@/features/TicketReserve/api/reservationApi';
import { createChangeRequest } from '../api/ticketChangeApi';

export const useMixSeats = () => {
  const { seatsState, setSeatsState } = seatsStateStore();
  const { groupedArray } = useSeatsGroupInfo();
  const { seatsChangeInfo } = seatsChangeInfoStore();
  const { seatsChangeTarget, setSeatsChangeTarget } = seatsChangeTargetStore();
  const { id } = seatIdsStore();
  const { prevSeatsTarget, setPrevSeatsTarget } = prevSeatsTargetStore();
  const { setSeatsTarget } = seatsTargetStore();
  const { trainNo } = trainDataStore();
  const { setShareKeepSeats } = shareKeepSeatsStore();
  const { setSeatsChangeMixTargetSeatId } = seatsChangeMixTargetSeatIdStore();

  const [keepSeats, setKeepSeats] = useState<SeatType[]>([]);
  const [seatsChangeMixTargetOrAllTarget, setSeatsChangeMixTargetOrAllTarget] =
    useState<string[]>([]);

  const location = useLocation();

  const mySeats = Array.isArray(location.state)
    ? (location.state as SeatType[])
    : [];

  const carNo = Number(trainNo) || 1;
  const tripId = mySeats[0]?.tripId;

  const filtered = Object.entries(seatsState)
    .filter(([, value]) => value === true)
    .map(([key]) => key);

  // 좌석 선점 (백엔드 holds)
  const lockSeat = async (seatId: string) => {
    if (!tripId) return;
    await holdSeats(tripId, carNo, [seatId]).catch(() => {});
  };

  const unlockSeat = async (seatId: string) => {
    if (!tripId) return;
    await releaseHolds(tripId, carNo, [seatId]).catch(() => {});
  };

  useEffect(() => {
    const mixedTargetSeatId = mySeats.map((_, i) => {
      return seatsChangeMixTargetOrAllTarget[i] ?? filtered[i];
    });
    setSeatsChangeMixTargetSeatId(mixedTargetSeatId);
  }, [seatsChangeMixTargetOrAllTarget, seatsState]);

  // 빈 좌석 클릭 시 이전에 선택한 좌석 상태 유지
  useEffect(() => {
    const filteredGroupSeats = groupedArray.filter(
      (item) => item.length <= mySeats.length,
    );
    const eachSeat = seatsChangeInfo.filter((item) => item.seatId === id);

    const selectedGroupSeatsByTime = filteredGroupSeats
      .flat()
      .filter((item) => {
        const isTarget = eachSeat[0]?.createAt;
        return item.createAt === isTarget;
      });

    setKeepSeats((prev) => {
      if (
        selectedGroupSeatsByTime.length === 0 ||
        prev.length === selectedGroupSeatsByTime.length
      ) {
        return prev;
      }
      return selectedGroupSeatsByTime;
    });
  }, [groupedArray, mySeats, seatsChangeInfo, id]);

  useEffect(() => {
    setShareKeepSeats(keepSeats);
  }, [keepSeats]);

  useEffect(() => {
    const targetIds = seatsChangeTarget.map((item) => item.seatId);

    if (mySeats.length === seatsChangeTarget.length) {
      if (seatsChangeMixTargetOrAllTarget.includes(id)) {
        for (const tid of targetIds) unlockSeat(tid);
        targetIds.length = 0;
      }
      setSeatsChangeMixTargetOrAllTarget(targetIds);
      // 상대방 예약 좌석은 hold 불가(409) — 빈 좌석만 선점
      for (const tid of targetIds) {
        const isOccupied = seatsChangeInfo.some((s) => s.seatId === tid);
        if (!isOccupied) lockSeat(tid);
      }
      setPrevSeatsTarget(targetIds);
    }

    if (mySeats.length > seatsChangeTarget.length) {
      setSeatsChangeMixTargetOrAllTarget((prev) => {
        const newSeats = prev.filter((item) => !prevSeatsTarget.includes(item));

        if (newSeats.includes(id)) {
          if (targetIds.includes(id)) {
            for (const ns of newSeats) unlockSeat(ns);
            newSeats.length = 0;
            return newSeats;
          }
          return newSeats.filter((item) => item !== id);
        }

        const result = Array.from(
          new Set([...newSeats, ...filtered, ...targetIds]),
        );
        for (const r of result) {
          const isOccupied = seatsChangeInfo.some((s) => s.seatId === r);
          if (!isOccupied) lockSeat(r);
        }
        return result;
      });
    }
  }, [seatsState, seatsChangeTarget]);

  useEffect(() => {
    setSeatsTarget(seatsChangeMixTargetOrAllTarget);
  }, [seatsChangeMixTargetOrAllTarget]);

  const resetSeatsState = () => {
    setSeatsChangeMixTargetOrAllTarget([]);
    setPrevSeatsTarget([]);
    setSeatsChangeTarget([]);
    setSeatsState({});
  };

  useEffect(() => {
    resetSeatsState();
    return () => resetSeatsState();
  }, [trainNo]);

  const mixSeatsChange = async (
    emptySeatsTarget: string[],
    mySeatsList: SeatType[],
    _newKeepSeats: SeatType[],
    mixSeatId: string[],
  ) => {
    const reservationIds = mySeatsList
      .map((s) => s.reservationId)
      .filter((id): id is number => id !== undefined);

    if (reservationIds.length === 0) return;

    // 혼합: 빈 좌석 + 상대방 좌석 합쳐서 변경 요청
    const toSeatIds = [...new Set([...emptySeatsTarget, ...mixSeatId])].slice(
      0,
      mySeatsList.length,
    );

    try {
      await createChangeRequest(reservationIds, carNo, toSeatIds);
    } catch (e) {
      console.log(e);
    }
  };

  return {
    mixSeatsChange,
    seatsChangeMixTargetOrAllTarget,
    keepSeats,
    setKeepSeats,
    setShareKeepSeats,
    locksByAll: {},
  };
};
