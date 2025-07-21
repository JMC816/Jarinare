import { SeatType } from '@/entities/Seat/types/seatType';
import { db } from '@/shared/firebase/firebase';
import { groupSeatsStore } from '@/widgets/TicketList/model/groupSeatsStore';
import { doc, runTransaction, setDoc, Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { seatsStateStore } from '../models/seatsStateStore';
import { useSeatsGroupInfo } from '@/features/TicketChange/hooks/useSeatsGroupInfo';
import { seatsChangeInfoStore } from '../models/seatsChangeInfoStore';
import { seatsChangeTargetStore } from '../models/seatsChangeTargetStore';
import { seatIdsStore } from '../models/seatIdsStore';
import { prevSeatsTargetStore } from '../models/prevSeatsTargetStore';
import { seatsTargetStore } from '../models/seatsTargetStore';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';

export const useMixSeats = () => {
  const { seatsState, setSeatsState } = seatsStateStore();
  const { groupSeats } = groupSeatsStore();
  const { groupedArray } = useSeatsGroupInfo() || {};
  const { seatsChangeInfo } = seatsChangeInfoStore();
  const { seatsChangeTarget, setSeatsChangeTarget } = seatsChangeTargetStore();
  const { id } = seatIdsStore();
  const { prevSeatsTarget, setPrevSeatsTarget } = prevSeatsTargetStore();
  const { setSeatsTarget } = seatsTargetStore();
  const { trainNo } = trainDataStore();

  const [keepSeats, setKeepSeats] = useState<SeatType[]>([]);
  const [seatsChangeMixTargetOrAllTarget, setSeatsChangeMixTargetOrAllTarget] =
    useState<string[]>([]);
  const [seatsChangeMixTargetSeatId, setSeatsChangeMixTargetSeatId] = useState<
    string[]
  >([]);

  // 좌석 id가 true인 것만 추출
  const filtered = Object.entries(seatsState)
    .filter(([_, value]) => value === true)
    .map(([key]) => key);

  useEffect(() => {
    // 예매된 본인의 좌석 개수만큼 상대방의 좌석 채우기,
    // 부족하면 빈 좌석으로 채우기
    // 각 좌석을 배열에 저장
    const mixedTargetSeatId = groupSeats.map((_, i) => {
      return seatsChangeMixTargetOrAllTarget[i] ?? filtered[i];
    });

    setSeatsChangeMixTargetSeatId(mixedTargetSeatId);
  }, [groupSeats, seatsChangeMixTargetOrAllTarget, seatsState]);

  // 빈 좌석 클릭 시 이전에 선택한 좌석 상태 유지
  useEffect(() => {
    const filteredGroupSeats = groupedArray.filter(
      (item) => item.length <= groupSeats.length,
    );
    const eachSeat = seatsChangeInfo.filter((item) => item.seatId === id);

    // 선택한 좌석이 동일한 생성 시간인 좌석들
    const selectedGroupSeatsByTime = filteredGroupSeats
      .flat()
      .filter((item) => {
        const isTarget = eachSeat[0]?.createAt;
        return item.createAt === isTarget;
      });

    setKeepSeats((prev) => {
      // 클릭한 좌석이 빈 좌석 또는 이전 좌석이 현재 클릭한 좌석의 개수와 같다면 이전 상태 유지
      // 그렇지 않으면 현재 값 반환
      if (
        selectedGroupSeatsByTime.length === 0 ||
        prev.length === selectedGroupSeatsByTime.length
      ) {
        return prev;
      }
      return selectedGroupSeatsByTime;
    });
  }, [groupedArray, groupSeats, seatsChangeInfo, id]);

  useEffect(() => {
    // 예매된 좌석들(본인 포함)
    const targetIds = seatsChangeTarget.map((item) => item.seatId);

    // 예매된 본인의 좌석 개수와 상대방의 좌석 개수가 동일한 경우
    if (groupSeats.length === seatsChangeTarget.length) {
      // 좌석 선택 취소
      if (seatsChangeMixTargetOrAllTarget.includes(id)) {
        targetIds.length = 0;
      }

      setSeatsChangeMixTargetOrAllTarget(targetIds);
      setPrevSeatsTarget(targetIds);
    }

    // 예매된 본인의 좌석 개수보다 상대방의 좌석 개수가 적은 경우
    if (groupSeats.length > seatsChangeTarget.length) {
      setSeatsChangeMixTargetOrAllTarget((prev) => {
        // 현재 상태에서 이전 상태(예매된 본인의 좌석 개수와 상대방의 좌석 개수가 동일한 경우)의 좌석들을 제외한 좌석들
        const newSeats = prev.filter((item) => !prevSeatsTarget.includes(item));

        // 좌석 선택 취소
        if (newSeats.includes(id)) {
          if (targetIds.includes(id)) {
            // 예매된 좌석이 클릭 시 제거
            newSeats.length = 0;
            return newSeats;
          }
          // 선택된 빈 좌석을 클릭 시 제거
          return newSeats.filter((item) => item !== id);
        }

        // 1. 현재 선택한 좌석(예매된 좌석 + 선택한 빈 좌석)
        // 2. 선택한 빈 좌석
        // 3. 예매된 좌석들 중 선택한 좌석
        // 를 결합하여 중복 제거한 값 반환
        return Array.from(new Set([...newSeats, ...filtered, ...targetIds]));
      });
    }
  }, [seatsState, seatsChangeTarget]);

  // 선택한 좌석 즉시 반영
  useEffect(() => {
    setSeatsTarget(seatsChangeMixTargetOrAllTarget);
  }, [seatsChangeMixTargetOrAllTarget]);

  // 호차 변경 시 선택한 좌석 애니메이션 초기화
  const resetSeatsState = () => {
    setSeatsChangeMixTargetOrAllTarget([]);
    setPrevSeatsTarget([]);
    setSeatsChangeTarget([]);
    setSeatsState({});
  };

  useEffect(() => {
    resetSeatsState();
    return resetSeatsState;
  }, [trainNo]);

  const mixSeatsChange = async () => {
    await runTransaction(db, async (transaction) => {
      const mySeatDocs = [];
      const targetSeatDocs = [];

      for (let i = 0; i < groupSeats.length; i++) {
        const mySeatRef = doc(
          db,
          'train',
          groupSeats[i].id,
          'no',
          groupSeats[i].trainNoId,
          'seats',
          groupSeats[i].seatId,
        );

        await setDoc(
          doc(
            db,
            'train',
            keepSeats[0].id,
            'no',
            keepSeats[0].trainNoId,
            'seats',
            seatsChangeMixTargetSeatId[i],
          ),
          {
            userId: keepSeats[0].userId,
            seatId: seatsChangeMixTargetSeatId[i],
            trainNoId: keepSeats[0].trainNoId,
            startDay: keepSeats[0].startDay,
            startTime: keepSeats[0].startTime,
            endTime: keepSeats[0].endTime,
            trainType: keepSeats[0].trainType,
            createAt: Timestamp.fromMillis(keepSeats[0].createAt * 1000),
            startDayForView: keepSeats[0].startDayForView,
            startStationForView: keepSeats[0].startStationForView,
            endStationForView: keepSeats[0].endStationForView,
            selectKid: keepSeats[0].selectAdult,
            selectAdult: keepSeats[0].selectAdult,
            selectPay: keepSeats[0].selectPay,
            id: keepSeats[0].id,
          },
        );

        const targetSeatRef = doc(
          db,
          'train',
          keepSeats[0].id,
          'no',
          keepSeats[0].trainNoId,
          'seats',
          seatsChangeMixTargetSeatId[i],
        );

        const mySeat = await transaction.get(mySeatRef);
        const targetSeat = await transaction.get(targetSeatRef);

        if (!mySeat.exists() || !targetSeat.exists()) return;

        // 각 좌석의 위치와 좌석 정보를 배열에 저장
        mySeatDocs.push({ ref: mySeatRef, data: mySeat.data() });
        targetSeatDocs.push({
          ref: targetSeatRef,
          data: targetSeat.data(),
        });
      }

      // 저장된 배열을 순회하면서 좌석을 교체
      for (let i = 0; i < groupSeats.length; i++) {
        const mySeatInfo = mySeatDocs[i];
        const targetSeatInfo = targetSeatDocs[i];

        // 현재 사용자의 위치에 맞게 상대방의 정보를 가져와 업데이트
        transaction.update(mySeatInfo.ref, {
          userId: targetSeatInfo.data.userId,
          selectAdult: targetSeatInfo.data.selectAdult,
          selectKid: targetSeatInfo.data.selectKid,
          selectPay: targetSeatInfo.data.selectPay,
          startStationForView: targetSeatInfo.data.startStationForView,
          endStationForView: targetSeatInfo.data.endStationForView,
        });

        // 상대방의 위치에 맞게 현재 사용자의 정보를 가져와 업데이트
        transaction.update(targetSeatInfo.ref, {
          userId: mySeatInfo.data.userId,
          selectAdult: mySeatInfo.data.selectAdult,
          selectKid: mySeatInfo.data.selectKid,
          selectPay: mySeatInfo.data.selectPay,
          startStationForView: mySeatInfo.data.startStationForView,
          endStationForView: mySeatInfo.data.endStationForView,
        });
      }

      // 업데이트 후 mySeatInfo.ref는 상대방의 좌석 정보를 담고 있으므로
      // 선택한 빈 좌석 만큼 상대방의 좌석 제거
      for (let i = 0; i < filtered.length; i++) {
        const mySeatInfo = mySeatDocs[i];
        transaction.delete(mySeatInfo.ref);
      }
    });
  };

  return {
    mixSeatsChange,
    seatsChangeMixTargetOrAllTarget,
    keepSeats,
    setKeepSeats,
  };
};
