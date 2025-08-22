import { auth, db, realtimeDb } from '@/shared/firebase/firebase';
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { trainDataStore } from '../model/trainDataStore';
import { useEffect, useState, useRef } from 'react';
import { SeatType } from '@/entities/Seat/types/seatType';
import { seatsStateStore } from '../model/seatsStateStore';
import { seatsStateCountStore } from '../model/seatsStateCountStore';
import { useNavigate } from 'react-router-dom';
import { seatsInfoStore } from '../model/seatsInfoStore';
import {
  onValue,
  ref,
  set,
  remove,
  onDisconnect,
  off,
  DataSnapshot,
} from 'firebase/database';

export const useSeatQueryData = () => {
  const {
    startDay,
    trainNo,
    selectStartTime,
    selectEndTime,
    selectTrainType,
    selectAdult,
    selectKid,
    startDayForView,
    startStationForView,
    endStationForView,
    selectPay,
  } = trainDataStore();

  const { seatsState, setSeatsState } = seatsStateStore();
  const { seatsInfo, setSeatsInfo } = seatsInfoStore();
  const [seatsAllInfo, setSeatAllInfo] = useState<SeatType[]>([]);
  const { seatsStateCount, setSeatsStateCount } = seatsStateCountStore();

  // 잠긴 좌석의 초기 렌더링 상태
  const [isLocksLoaded, setIsLocksLoaded] = useState(false);
  // 좌석 중복 클릭 방지
  const isSelectingRef = useRef<Record<string, boolean>>({});
  // 좌석 연속 클릭 방지
  const [isMutating, setIsMutating] = useState(false);

  // 실시간으로 받는 상대방 잠금 상태 {seatId, userId}
  const [locks, setLocks] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const user = auth.currentUser;
  const docIds = `${startDay}_${selectStartTime}_${selectTrainType}`;

  // 선택된 좌석 수
  const selectedCount = Object.values(seatsState).filter(Boolean).length;

  // 호차 변경 시 좌석 선택 초기화
  useEffect(() => {
    setSeatsState({});
  }, [trainNo]);

  // 각 호차별 실시간 좌석 상태
  useEffect(() => {
    if (!trainNo) return;

    const seatsQuery = query(
      collection(db, 'train', docIds, 'no', trainNo, 'seats'),
      orderBy('createAt', 'asc'),
    );

    const unsub = onSnapshot(seatsQuery, (snap) => {
      const seats = snap.docs.map((item) => {
        const data = item.data();
        const ts: Timestamp = data.createAt;

        // serverTimestamp()는 처음엔 null일 수 있으므로 방어코드
        const createAtSeconds =
          typeof ts?.seconds === 'number'
            ? ts.seconds
            : typeof ts?.toMillis === 'function'
              ? Math.floor(ts.toMillis() / 1000)
              : 0;

        return {
          seatId: data.seatId,
          userId: data.userId,
          trainNoId: data.trainNoId,
          startDay: data.startDay,
          startTime: data.startTime,
          endTime: data.endTime,
          trainType: data.trainType,
          createAt: createAtSeconds,
          startDayForView: data.startDayForView,
          startStationForView: data.startStationForView,
          endStationForView: data.endStationForView,
          selectKid: data.selectKid,
          selectAdult: data.selectAdult,
          selectPay: data.selectPay,
          id: data.id,
        } as SeatType;
      });

      setSeatsInfo(seats);
    });

    return () => unsub();
  }, [db, docIds, trainNo]);

  // 각 사용자의 모든 호차 좌석 개수
  useEffect(() => {
    const getAllSeats = async () => {
      if (!user) return;

      const trainNos = ['1', '2', '3', '4'];

      let allSeats: SeatType[] = [];

      try {
        const trainCol = await getDocs(collection(db, 'train'));

        await Promise.all(
          trainCol.docs.map(async (trainDoc) => {
            for (const trainNoId of trainNos) {
              const seatsQuery = query(
                collection(db, 'train', trainDoc.id, 'no', trainNoId, 'seats'),
                orderBy('createAt'),
              );

              const existSeats = await getDocs(seatsQuery);
              const seats = existSeats.docs.map((item) => {
                const data = item.data();

                const ts: Timestamp = data.createAt;
                const createAtSeconds =
                  typeof ts?.seconds === 'number'
                    ? ts.seconds
                    : typeof ts?.toMillis === 'function'
                      ? Math.floor(ts.toMillis() / 1000)
                      : 0;

                return {
                  seatId: data.seatId,
                  userId: data.userId,
                  trainNoId: data.trainNoId,
                  startDay: data.startDay,
                  startTime: data.startTime,
                  endTime: data.endTime,
                  trainType: data.trainType,
                  createAt: createAtSeconds,
                  startDayForView: data.startDayForView,
                  startStationForView: data.startStationForView,
                  endStationForView: endStationForView,
                  selectKid: data.selectKid,
                  selectAdult: data.selectAdult,
                  selectPay: data.selectPay,
                  id: data.id,
                } as SeatType;
              });

              // 각 호차들의 좌석들을 배열에 저장
              allSeats = [...allSeats, ...seats];
            }
          }),
        );

        setSeatAllInfo(allSeats);
      } catch (e) {
        console.log(e);
      }
    };

    getAllSeats();
  }, [trainNo]); // 성능상 필요할 때만 돌리기기

  // 실시간 상대방 좌석 잠금
  useEffect(() => {
    if (!trainNo) return;
    const path = `locks/${docIds}/${trainNo}`;
    const dbRef = ref(realtimeDb, path);

    const cb = (snapshot: DataSnapshot) => {
      const seats = (snapshot.val() as Record<string, string>) || {};

      // 상대방이 선택한 좌석
      const othersOnly = Object.fromEntries(
        Object.entries(seats).filter(([, uid]) => uid !== user?.uid),
      );
      setLocks(othersOnly);
      setIsLocksLoaded(true);
    };

    onValue(dbRef, cb);
    return () => {
      // 실시간 DB는 off로 직접 해제
      off(dbRef, 'value', cb);
    };
  }, [realtimeDb, docIds, trainNo]);

  // 좌석 잠금
  const lockSeat = async (seatId: string) => {
    if (!user) return;
    const seatLockRef = ref(realtimeDb, `locks/${docIds}/${trainNo}/${seatId}`);
    await set(seatLockRef, user.uid);

    // 브라우저가 닫히면 자동 해제
    onDisconnect(seatLockRef).remove();
  };

  // 좌석 잠금 해제
  const unlockSeat = async (seatId: string) => {
    const seatLockRef = ref(realtimeDb, `locks/${docIds}/${trainNo}/${seatId}`);
    await remove(seatLockRef);
  };

  const handleSingleSelect = async (id: string) => {
    if (!user) return;

    if (isSelectingRef.current[id]) return;
    isSelectingRef.current[id] = true;
    try {
      // 선택할려는 좌석이 이미 예매된 좌석(본인 포함)이거나
      // 잠긴 좌석(상대방)이면 선택 불가
      const isMineOrOthers = seatsInfo.some(
        (item) => item.trainNoId === trainNo && item.seatId === id,
      );
      const isLockedByOther = !!locks[id];
      if (isMineOrOthers || isLockedByOther) return;

      const isSelected = seatsState[id] === true;

      // 선택한 좌석을 다시 선택하면 빈 좌석으로 바뀐다.
      if (isSelected) {
        setSeatsState({ ...seatsState, [id]: false });
        // 빈 좌석으로 되면 잠금 해제
        await unlockSeat(id);
        return;
      }

      // 선택 인원 수 제한
      if (selectedCount >= selectAdult + selectKid) return;

      // 빈 좌석을 선택하면 선택한 좌석으로 바뀐다.
      setSeatsState({ ...seatsState, [id]: true });
      // 선택한 후 잠금
      await lockSeat(id);
    } finally {
      // 빈 좌석으로 바뀌면 해제
      isSelectingRef.current[id] = false;
    }
  };

  const handleAllSelect = async () => {
    if (!isLocksLoaded) return;
    if (isMutating) return;
    setIsMutating(true);

    // 빈 좌석이 선택할 좌석 만큼 없으면 선택 막기
    const reservedSeatIds = seatsInfo.map((id) => id.seatId);

    // 다른 사용자의 잠금된 좌석
    const lockedSeatIds = Object.keys(locks);

    const isAllSelectedCount = selectKid + selectAdult;

    if (24 - reservedSeatIds.length - lockedSeatIds.length < isAllSelectedCount)
      return;

    const rows = ['A', 'B', 'C', 'D'];
    const columns = 6;
    const selectedSeatIds: string[] = [];

    while (selectedSeatIds.length < isAllSelectedCount) {
      // A ~ D
      const randomRow = rows[Math.floor(Math.random() * rows.length)];
      // 1 ~ 6
      const randomColumn = Math.floor(Math.random() * columns + 1);
      const seatId = `${randomRow}${randomColumn}`;

      const isAlreadySelected = selectedSeatIds.includes(seatId);
      const isReserved = reservedSeatIds.includes(seatId);
      const islocked = lockedSeatIds.includes(seatId);

      // 이미 선택했거나 예약된 좌석이거나 잠긴 좌석은 제외
      if (isAlreadySelected || isReserved || islocked) continue;

      selectedSeatIds.push(seatId);
    }

    // 순회한 좌석들을 newState에 저장 및 잠금
    const multipleSeatsState = { ...seatsState };
    for (const id of selectedSeatIds) {
      multipleSeatsState[id] = true;
      await lockSeat(id);
    }
    // 여러 좌석들을 한 번에 선택
    setSeatsState(multipleSeatsState);
    setIsMutating(false);
  };

  useEffect(() => {
    // 호차 변경 시 좌석 잠금 해제
    const resetLocksChangedTrainNoId = async () => {
      const filtered = Object.entries(seatsState)
        .filter(([_, value]) => value === true)
        .map(([key]) => key);
      await Promise.all(
        filtered.map((seatId) =>
          remove(ref(realtimeDb, `locks/${docIds}/${trainNo}/${seatId}`)),
        ),
      );
    };
    resetLocksChangedTrainNoId();
  }, [trainNo]);

  useEffect(() => {
    // 선택한 좌석 즉시 반영
    setSeatsStateCount(selectedCount);
  }, [seatsState]);

  const createSelectedSeats = async () => {
    if (!user) return;
    if (isMutating) return;
    setIsMutating(true);

    const filtered = Object.entries(seatsState)
      .filter(([_, value]) => value === true)
      .map(([key]) => key);

    try {
      await Promise.all(
        filtered.map((seatId) =>
          setDoc(doc(db, 'train', docIds, 'no', trainNo, 'seats', seatId), {
            userId: user.uid,
            seatId,
            trainNoId: trainNo,
            startDay,
            startTime: selectStartTime,
            endTime: selectEndTime,
            trainType: selectTrainType,
            createAt: serverTimestamp(),
            startDayForView,
            startStationForView,
            endStationForView,
            selectKid,
            selectAdult,
            selectPay,
            id: docIds,
          }),
        ),
      );

      await setDoc(doc(db, 'train', docIds), { id: docIds });

      // 좌석 예매 후 잠금 해제 및 좌석 상태 초기화
      await Promise.all(
        filtered.map((seatId) =>
          remove(ref(realtimeDb, `locks/${docIds}/${trainNo}/${seatId}`)),
        ),
      );
      setSeatsState({});

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
