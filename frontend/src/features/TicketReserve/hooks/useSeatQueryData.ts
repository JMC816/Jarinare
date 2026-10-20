/**
 * @role: features/hooks
 * @rule: 예매 흐름(좌석 현황·선점·예매 확정) 상태와 핸들러만 담당
 */
import { trainDataStore } from '../model/trainDataStore';
import { useEffect, useState, useRef } from 'react';
import { SeatType } from '@/entities/Seat/types/seatType';
import { seatsStateStore } from '../model/seatsStateStore';
import { seatsStateCountStore } from '../model/seatsStateCountStore';
import { useNavigate } from 'react-router-dom';
import { seatsInfoStore } from '../model/seatsInfoStore';
import {
  getCachedAllSeats,
  useAllSeatsInfo,
  clearAllSeatsCache,
  prefetchAllSeats,
} from './useAllSeatsInfo';
import {
  upsertTrip,
  fetchCarSeats,
  holdSeats,
  releaseHolds,
  createReservation,
} from '../api/reservationApi';
import { ACCESS_TOKEN_KEY } from '@/shared/api/backendClient';
import welcomeTourStore from '@/shared/models/welcomeTourStore';

const DEMO_LOCKS: Record<string, string> = {
  A1: 'other', C2: 'other', B4: 'other',
  D5: 'other', A7: 'other', C9: 'other',
};

export const useSeatQueryData = () => {
  const {
    startStation,
    endStation,
    selectStartTime,
    selectEndTime,
    selectTrainType,
    selectAdult,
    selectKid,
    startStationForView,
    endStationForView,
    trainNo,
    tripId,
    setTripId,
  } = trainDataStore();

  const { seatsState, setSeatsState } = seatsStateStore();
  const { seatsInfo, setSeatsInfo } = seatsInfoStore();
  const [seatsAllInfo, setSeatAllInfo] =
    useState<SeatType[]>(getCachedAllSeats());
  const { seatsStateCount, setSeatsStateCount } = seatsStateCountStore();

  const [isLocksLoaded, setIsLocksLoaded] = useState(false);
  const isSelectingRef = useRef<Record<string, boolean>>({});
  const [isMutating, setIsMutating] = useState(false);

  const [locks, setLocks] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { isActive: isTourActive } = welcomeTourStore();

  const selectedCount = Object.values(seatsState).filter(Boolean).length;
  const carNo = Number(trainNo) || 1;

  // 좌석 선택이 달라질 때 선택 좌석 수 반영
  useEffect(() => {
    setSeatsStateCount(selectedCount);
  }, [seatsState]);

  // 열차 선택 시 tripId upsert
  useEffect(() => {
    if (isTourActive) return;
    if (
      !selectStartTime ||
      !selectEndTime ||
      !selectTrainType ||
      !startStation ||
      !endStation ||
      !startStationForView ||
      !endStationForView
    )
      return;
    const parts = selectTrainType.split('-');
    const trainNumber = parts[parts.length - 1];
    const trainType = parts.slice(0, -1).join('-');
    upsertTrip({
      trainNo: trainNumber,
      trainType: trainType || selectTrainType,
      depPlaceId: startStation,
      arrPlaceId: endStation,
      depPlandTime: String(selectStartTime).substring(0, 12),
      arrPlandTime: String(selectEndTime).substring(0, 12),
      depName: startStationForView,
      arrName: endStationForView,
    })
      .then((trip) => setTripId(trip.tripId))
      .catch((e) => console.error('[upsertTrip 실패]', e?.response?.data ?? e));
  }, [
    selectStartTime,
    selectEndTime,
    selectTrainType,
    startStation,
    endStation,
    startStationForView,
    endStationForView,
  ]);

  // tripId 세팅되면 즉시 클릭 활성화 (fetchCarSeats 완료 대기 불필요)
  useEffect(() => {
    if (tripId) setIsLocksLoaded(true);
  }, [tripId]);

  // 투어 모드: 목업 좌석 잠금 설정 (API 호출 없이 즉시 활성화)
  useEffect(() => {
    if (!isTourActive) return;
    setLocks(DEMO_LOCKS);
    setIsLocksLoaded(true);
  }, [isTourActive]);

  // 호차별 좌석 현황 폴링 (5초)
  useEffect(() => {
    if (isTourActive || !tripId || !carNo) return;
    let active = true;

    const load = async () => {
      try {
        const carData = await fetchCarSeats(tripId, carNo);
        if (!active) return;
        // 예매된 좌석만 SeatType 형태로 seatsInfo에 저장 (점유 여부 판단용)
        const occupied: SeatType[] = carData.seats
          .filter((s) => s.state === 'RESERVED' || s.state === 'MINE')
          .map((s) => ({
            seatId: s.seatId,
            userId: s.state === 'MINE' ? 'me' : 'other',
            trainNoId: String(carNo),
            startDay: '',
            startTime: selectStartTime,
            endTime: selectEndTime,
            trainType: selectTrainType,
            createAt: 0,
            startDayForView: '',
            startStationForView,
            endStationForView,
            selectKid: 0,
            selectAdult: 0,
            selectPay: 0,
            id: '',
          }));
        setSeatsInfo(occupied);
        // HELD_BY_ME 는 내가 선점 중인 좌석 — locks에서 제외
        const heldByOthers: Record<string, string> = {};
        carData.seats
          .filter((s) => s.state === 'HELD')
          .forEach((s) => {
            heldByOthers[s.seatId] = 'other';
          });
        setLocks(heldByOthers);
        setIsLocksLoaded(true);
      } catch {
        // silent
      }
    };

    load();
    const timer = setInterval(load, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [tripId, carNo]);

  // 호차 변경 시 이전 호차 선점 해제
  const prevCarNoRef = useRef<number>(carNo);
  useEffect(() => {
    const prev = prevCarNoRef.current;
    if (prev !== carNo && tripId) {
      releaseHolds(tripId, prev).catch(() => {});
    }
    prevCarNoRef.current = carNo;
  }, [carNo, tripId]);

  // 캐시된 데이터 반영
  useAllSeatsInfo((seats) => setSeatAllInfo(seats));

  // 좌석 선점
  const lockSeat = async (seatId: string): Promise<boolean> => {
    if (!tripId) return false;
    try {
      await holdSeats(tripId, carNo, [seatId]);
      return true;
    } catch {
      return false;
    }
  };

  // 좌석 선점 해제
  const unlockSeat = async (seatId: string) => {
    if (!tripId) return;
    await releaseHolds(tripId, carNo, [seatId]).catch(() => {});
  };

  const handleSingleSelect = async (id: string) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) {
      return;
    }
    if (isSelectingRef.current[id]) {
      return;
    }
    isSelectingRef.current[id] = true;
    try {
      const isMineOrOthers = seatsInfo.some(
        (item) => item.trainNoId === String(carNo) && item.seatId === id,
      );
      if (isMineOrOthers) {
        return;
      }

      const isSelected = seatsState[id] === true;
      if (isSelected) {
        setSeatsState({ ...seatsState, [id]: false });
        await unlockSeat(id);
        return;
      }
      if (selectedCount >= selectAdult + selectKid) {
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

  const handleAllSelect = async () => {
    if (!isLocksLoaded || isMutating || !tripId) return;
    setIsMutating(true);

    const reservedSeatIds = seatsInfo.map((id) => id.seatId);
    const lockedSeatIds = Object.keys(locks);
    const isAllSelectedCount = selectKid + selectAdult;

    if (
      24 - reservedSeatIds.length - lockedSeatIds.length <
      isAllSelectedCount
    ) {
      setIsMutating(false);
      return;
    }

    const rows = ['A', 'B', 'C', 'D'];
    const columns = [1, 2, 3, 4, 5, 6];

    const isAvailable = (seatId: string): boolean =>
      !reservedSeatIds.includes(seatId) &&
      !lockedSeatIds.includes(seatId) &&
      !seatsState[seatId];

    let selectedSeatIds: string[] = [];

    if (isAllSelectedCount === 2) {
      for (const col of columns) {
        const pairs = [
          ['A', 'B'],
          ['B', 'C'],
          ['C', 'D'],
        ];
        for (const [r1, r2] of pairs) {
          if (isAvailable(`${r1}${col}`) && isAvailable(`${r2}${col}`)) {
            selectedSeatIds = [`${r1}${col}`, `${r2}${col}`];
            break;
          }
        }
        if (selectedSeatIds.length) break;
      }
    } else if (isAllSelectedCount === 3) {
      for (const col of columns) {
        if (col >= 6) continue;
        const patterns = [
          [`A${col}`, `B${col}`, `A${col + 1}`],
          [`B${col}`, `C${col}`, `B${col + 1}`],
          [`C${col}`, `D${col}`, `C${col + 1}`],
          [`A${col}`, `B${col}`, `B${col + 1}`],
        ];
        for (const pattern of patterns) {
          if (pattern.every(isAvailable)) {
            selectedSeatIds = pattern;
            break;
          }
        }
        if (selectedSeatIds.length) break;
      }
    } else if (isAllSelectedCount === 4) {
      for (const col of columns) {
        if (col >= 6) continue;
        const patterns = [
          [`A${col}`, `B${col}`, `A${col + 1}`, `B${col + 1}`],
          [`B${col}`, `C${col}`, `B${col + 1}`, `C${col + 1}`],
          [`C${col}`, `D${col}`, `C${col + 1}`, `D${col + 1}`],
        ];
        for (const pattern of patterns) {
          if (pattern.every(isAvailable)) {
            selectedSeatIds = pattern;
            break;
          }
        }
        if (selectedSeatIds.length) break;
      }
    }

    // fallback: 랜덤 선택
    if (selectedSeatIds.length < isAllSelectedCount) {
      selectedSeatIds = [];
      const available: string[] = [];
      for (const row of rows) {
        for (const col of columns) {
          if (isAvailable(`${row}${col}`)) available.push(`${row}${col}`);
        }
      }
      while (
        selectedSeatIds.length < isAllSelectedCount &&
        available.length > 0
      ) {
        const idx = Math.floor(Math.random() * available.length);
        selectedSeatIds.push(available[idx]);
        available.splice(idx, 1);
      }
    }

    const multipleSeatsState = { ...seatsState };
    for (const id of selectedSeatIds) {
      multipleSeatsState[id] = true;
      await lockSeat(id);
    }
    setSeatsState(multipleSeatsState);
    setIsMutating(false);
  };

  const createSelectedSeats = async (finalPrice: number) => {
    if (!localStorage.getItem(ACCESS_TOKEN_KEY) || !tripId) return;
    if (isMutating) return;
    setIsMutating(true);

    const currentSeatsState = seatsStateStore.getState().seatsState;
    const filtered = Object.entries(currentSeatsState)
      .filter(([, value]) => value === true)
      .map(([key]) => key);

    if (filtered.length === 0) {
      setIsMutating(false);
      return;
    }

    const {
      selectStartTime: depTime,
      selectEndTime: arrTime,
      selectTrainType: tType,
      trainNo: tNo,
      startStation: dep,
      endStation: arr,
      startStationForView: depName,
      endStationForView: arrName,
      selectKid: kid,
      selectAdult: adult,
      tripId: currentTripId,
      startDayForView: dayView,
    } = trainDataStore.getState();

    const currentCarNo = Number(tNo) || 1;

    let currentTripId2 = currentTripId;
    if (!currentTripId2) {
      const parts = tType.split('-');
      const trainNumber = parts[parts.length - 1];
      const trainType = parts.slice(0, -1).join('-');
      try {
        const trip = await upsertTrip({
          trainNo: trainNumber,
          trainType: trainType || tType,
          depPlaceId: dep,
          arrPlaceId: arr,
          depPlandTime: String(depTime).substring(0, 12),
          arrPlandTime: String(arrTime).substring(0, 12),
          depName,
          arrName,
        });
        currentTripId2 = trip.tripId;
        setTripId(trip.tripId);
      } catch {
        setIsMutating(false);
        return;
      }
    }

    try {
      await createReservation({
        tripId: currentTripId2,
        carNo: currentCarNo,
        seatIds: filtered,
        adult,
        kid,
        totalPrice: finalPrice,
        startDayForView: dayView,
      });

      setSeatsState({});
      setSeatsStateCount(0);
      clearAllSeatsCache();
      await prefetchAllSeats();
      navigate('/');
    } catch (e) {
      console.log(e);
    } finally {
      setIsMutating(false);
    }
  };

  return {
    handleSingleSelect,
    handleAllSelect,
    createSelectedSeats,
    seatsState,
    seatsInfo,
    seatsAllInfo,
    seatsStateCount,
    locks,
    isLocksLoaded,
  };
};
