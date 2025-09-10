import { SeatType } from '@/entities/Seat/types/seatType';
import { auth, db, realtimeDb } from '@/shared/firebase/firebase';
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
import { shareKeepSeatsStore } from '../models/shareKeepSeatsStore';
import { seatsChangeMixTargetSeatIdStore } from '../models/seatsChangeMixTargetSeatIdStore';
import {
  DataSnapshot,
  get,
  off,
  onDisconnect,
  onValue,
  ref,
  remove,
  set,
} from 'firebase/database';
import { useLocation } from 'react-router-dom';
import { SeatLockType } from '@/entities/Seat/types/seatLockType';
import { deleteLocksByRequestStore } from '@/features/Notification/models/deleteLocksByRequestStore';
import { deleteLocksByResponseStore } from '@/features/Notification/models/deleteLocksByResponseStore';

export const useMixSeats = () => {
  const { seatsState, setSeatsState } = seatsStateStore();
  const { groupedArray } = useSeatsGroupInfo();
  const { seatsChangeInfo } = seatsChangeInfoStore();
  const { seatsChangeTarget, setSeatsChangeTarget } = seatsChangeTargetStore();
  const { id } = seatIdsStore();
  const { prevSeatsTarget, setPrevSeatsTarget } = prevSeatsTargetStore();
  const { setSeatsTarget } = seatsTargetStore();
  const { trainNo, startDay, selectStartTime, selectTrainType } =
    trainDataStore();
  const { setShareKeepSeats } = shareKeepSeatsStore();
  const { setSeatsChangeMixTargetSeatId } = seatsChangeMixTargetSeatIdStore();
  const { setDeleteLocksByRequest } = deleteLocksByRequestStore();
  const { setDeleteLocksByResponse } = deleteLocksByResponseStore();

  const [keepSeats, setKeepSeats] = useState<SeatType[]>([]);
  const [seatsChangeMixTargetOrAllTarget, setSeatsChangeMixTargetOrAllTarget] =
    useState<string[]>([]);
  const [locks, setLocks] = useState<Record<string, SeatLockType>>({});
  const [locksByMine, setLocksByMine] = useState<Record<string, SeatLockType>>(
    {},
  );
  const [locksByAll, setLocksByAll] = useState<Record<string, SeatLockType>>(
    {},
  );

  const location = useLocation();

  const mySeats = Array.isArray(location.state)
    ? (location.state as SeatType[])
    : [];

  const user = auth.currentUser;

  const docIds = `${startDay}_${selectStartTime}_${selectTrainType}`;

  // 좌석 id가 true인 것만 추출
  const filtered = Object.entries(seatsState)
    .filter(([, value]) => value === true)
    .map(([key]) => key);

  // 실시간 상대방 좌석 잠금
  useEffect(() => {
    const path = `locks/${docIds}/${trainNo}`;
    const dbRef = ref(realtimeDb, path);

    const cb = async (snapshot: DataSnapshot) => {
      const seats = (snapshot.val() as Record<string, SeatLockType>) || {};

      const myOnly = Object.fromEntries(
        Object.entries(seats).filter(([, seat]) => seat.userId === user?.uid),
      );
      setLocksByMine(myOnly);

      const allOnly = Object.fromEntries(Object.entries(seats));
      setLocksByAll(allOnly);

      // 상대방이 선택한 좌석
      const othersOnly = Object.fromEntries(
        Object.entries(seats).filter(([, seat]) => seat.userId !== user?.uid),
      );

      setLocks(othersOnly);
    };

    onValue(dbRef, cb);
    return () =>
      // 실시간 DB는 off로 직접 해제
      off(dbRef, 'value', cb);
  }, [realtimeDb, docIds, trainNo]);

  // 호차 변경시 좌석 잠금 해제
  useEffect(() => {
    const removeLocksByTrainNoId = async () => {
      const seatIds = Object.keys(locksByMine);
      const trainNoId = Object.entries(locksByMine).map(
        (item) => item[1].trainNo,
      );
      seatIds.map(async (item) => {
        const seatLockRef = ref(
          realtimeDb,
          `locks/${docIds}/${trainNoId[0]}/${item}`,
        );
        await remove(seatLockRef);
      });
    };
    removeLocksByTrainNoId();
  }, [trainNo]);

  // 변경할 좌석의 티켓 페이지로 이동 시 좌석 잠금 해제
  if (location.pathname === '/ticket/seatchange') {
    const seatIds = Object.keys(locksByMine);

    const trainNoId = Object.entries(locksByMine).map(
      (item) => item[1].trainNo,
    );
    seatIds.map(async (item) => {
      const seatLockRef = ref(
        realtimeDb,
        `locks/${docIds}/${trainNoId[0]}/${item}`,
      );
      await remove(seatLockRef);
    });
  }
  // 좌석 잠금
  const lockSeat = async (seatId: string) => {
    if (!user) return;
    const seatLockRef = ref(realtimeDb, `locks/${docIds}/${trainNo}/${seatId}`);
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
    const seatLockRef = ref(realtimeDb, `locks/${docIds}/${trainNo}/${seatId}`);
    await remove(seatLockRef);
  };

  useEffect(() => {
    // 예매된 본인의 좌석 개수만큼 상대방의 좌석 채우기,
    // 부족하면 빈 좌석으로 채우기
    // 각 좌석을 배열에 저장
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
  }, [groupedArray, mySeats, seatsChangeInfo, id]);

  // 알림 기능에서 데이터 전송 시 사용할 이전 좌석 상태
  useEffect(() => {
    setShareKeepSeats(keepSeats);
  }, [keepSeats]);

  useEffect(() => {
    // 예매된 좌석들(본인 포함)
    const targetIds = seatsChangeTarget.map((item) => item.seatId);

    // 예매된 본인의 좌석 개수와 상대방의 좌석 개수가 동일한 경우
    if (mySeats.length === seatsChangeTarget.length) {
      // 상대방이 타 좌석을 점유중일 때 상대방의 예매된 좌석은 선택 불가
      const isLockedByOtherSeats = Object.entries(locks)[0]?.[1].mySeats?.map(
        (item) => item.seatId,
      );
      if (
        seatsChangeTarget.some((item) =>
          isLockedByOtherSeats?.includes(item.seatId),
        )
      )
        return;

      // 상대방이 점유한 좌석은 선택 불가
      for (let i = 0; i < seatsChangeTarget.length; i++) {
        const isLockedByOther = !!locks[id];
        if (isLockedByOther) {
          return;
        }
      }

      // 좌석 선택 취소
      if (seatsChangeMixTargetOrAllTarget.includes(id)) {
        for (let i = 0; i < targetIds.length; i++) {
          unlockSeat(targetIds[i]);
        }
        targetIds.length = 0;
      }
      // 좌석 선택 및 잠금
      setSeatsChangeMixTargetOrAllTarget(targetIds);
      for (let i = 0; i < targetIds.length; i++) {
        lockSeat(targetIds[i]);
      }
      setPrevSeatsTarget(targetIds);
    }

    // 예매된 본인의 좌석 개수보다 상대방의 좌석 개수가 적은 경우
    if (mySeats.length > seatsChangeTarget.length) {
      // 상대방이 타 좌석을 점유중일 때 상대방의 예매된 좌석은 선택 불가
      const isLockedByOtherSeats = Object.entries(locks)[0]?.[1].mySeats?.map(
        (item) => item.seatId,
      );
      if (
        seatsChangeTarget.some((item) =>
          isLockedByOtherSeats?.includes(item.seatId),
        )
      )
        return;

      // 상대방이 점유한 좌석은 선택 불가
      for (let i = 0; i < seatsChangeTarget.length; i++) {
        const isLockedByOther = !!locks[id];
        if (isLockedByOther) {
          return;
        }
      }
      setSeatsChangeMixTargetOrAllTarget((prev) => {
        // 현재 상태에서 이전 상태(예매된 본인의 좌석 개수와 상대방의 좌석 개수가 동일한 경우)의 좌석들을 제외한 좌석들
        const newSeats = prev.filter((item) => !prevSeatsTarget.includes(item));

        // 좌석 선택 취소
        if (newSeats.includes(id)) {
          if (targetIds.includes(id)) {
            // 취소시 잠금 해제
            for (let i = 0; i < newSeats.length; i++) {
              unlockSeat(newSeats[i]);
            }
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
        // 를 결합하여 중복 제거한 값 잠금 및 반환
        const result = Array.from(
          new Set([...newSeats, ...filtered, ...targetIds]),
        );
        for (let i = 0; i < result.length; i++) {
          lockSeat(result[i]);
        }

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
    return () => resetSeatsState();
  }, [trainNo]);

  // 변경 요청을 받은 사람의 좌석을 잠금
  useEffect(() => {
    const seatsChangeBlocked = async () => {
      if (!user) return;

      const snapshot = await get(ref(realtimeDb));
      const data = Object(snapshot.val());

      const filteredKeys = Object.keys(data).filter((key) => key !== 'locks');

      for (const key of filteredKeys) {
        const allDbRef = await get(ref(realtimeDb, key));
        if (allDbRef.exists()) {
          const values = allDbRef.val();

          const mySeats = (
            Object.entries(values)[0][1] as {
              mySeat: SeatType[];
            }
          ).mySeat;

          mySeats?.map(async (item) => {
            const seatLockRef = ref(
              realtimeDb,
              `locks/${mySeats[0].id}/${mySeats[0].trainNoId}/${item.seatId}`,
            );
            setDeleteLocksByResponse(
              mySeats[0].id,
              mySeats[0].trainNoId,
              mySeats.map((item) => item.seatId),
            );

            await set(seatLockRef, {
              mySeats,
            });
          });
        }
      }
    };
    seatsChangeBlocked();
  }, []);

  // 변경 요청을 보낸 사람의 좌석을 잠금
  useEffect(() => {
    const seatLocksByRequest = async () => {
      if (!user) return;

      const snapshot = await get(ref(realtimeDb));
      const data = Object(snapshot.val());

      const filteredKeys = Object.keys(data).filter((key) => key !== 'locks');

      // 좌석 변경 요청 데이터의 키(userId)
      for (const key of filteredKeys) {
        // 요청을 받은, 즉 상대방의 모든 요청 데이터
        const allDbRef = await get(ref(realtimeDb, key));

        if (allDbRef.exists()) {
          const values = allDbRef.val();

          // 변경 요청을 받은 좌석 데이터들
          const mixSeatId = (
            Object.entries(values)[0][1] as {
              mixTarget: {
                seatsChangeMixTargetSeatId: string[];
              };
            }
          ).mixTarget?.seatsChangeMixTargetSeatId;

          const mixId = (
            Object.entries(values)[0][1] as {
              mixTarget: {
                id: string;
              };
            }
          ).mixTarget?.id;

          const mixTrainNoId = (
            Object.entries(values)[0][1] as {
              mixTarget: {
                trainNoId: string;
              };
            }
          ).mixTarget?.trainNoId;

          mixSeatId?.map(async (item) => {
            const seatLockRef = ref(
              realtimeDb,
              `locks/${mixId}/${mixTrainNoId}/${item}`,
            );
            setDeleteLocksByRequest(mixId, mixTrainNoId, mixSeatId);
            await set(seatLockRef, {
              mixSeatId,
            });
          });
        }
      }
    };
    seatLocksByRequest();
  }, []);

  const mixSeatsChange = async (
    emptySeatsTarget: string[],
    mySeats: SeatType[],
    newKeepSeats: SeatType[],
    mixSeatId: string[],
  ) => {
    await runTransaction(db, async (transaction) => {
      const mySeatDocs = [];
      const targetSeatDocs = [];

      for (let i = 0; i < mySeats.length; i++) {
        const mySeatRef = doc(
          db,
          'train',
          mySeats[i].id,
          'no',
          mySeats[i].trainNoId,
          'seats',
          mySeats[i].seatId,
        );

        await setDoc(
          doc(
            db,
            'train',
            newKeepSeats[0].id,
            'no',
            newKeepSeats[0].trainNoId,
            'seats',
            mixSeatId[i],
          ),
          {
            userId: newKeepSeats[0].userId,
            seatId: mixSeatId[i],
            trainNoId: newKeepSeats[0].trainNoId,
            startDay: newKeepSeats[0].startDay,
            startTime: newKeepSeats[0].startTime,
            endTime: newKeepSeats[0].endTime,
            trainType: newKeepSeats[0].trainType,
            createAt: Timestamp.fromMillis(newKeepSeats[0].createAt * 1000),
            startDayForView: newKeepSeats[0].startDayForView,
            startStationForView: newKeepSeats[0].startStationForView,
            endStationForView: newKeepSeats[0].endStationForView,
            selectKid: newKeepSeats[0].selectAdult,
            selectAdult: newKeepSeats[0].selectAdult,
            selectPay: newKeepSeats[0].selectPay,
            id: newKeepSeats[0].id,
          },
        );

        const targetSeatRef = doc(
          db,
          'train',
          newKeepSeats[0].id,
          'no',
          newKeepSeats[0].trainNoId,
          'seats',
          mixSeatId[i],
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
      for (let i = 0; i < mySeats.length; i++) {
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
      for (let i = 0; i < emptySeatsTarget.length; i++) {
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
    setShareKeepSeats,
    locksByAll,
  };
};
