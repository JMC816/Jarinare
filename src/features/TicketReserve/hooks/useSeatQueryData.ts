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
  QuerySnapshot,
  DocumentData,
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
  remove,
  onDisconnect,
  off,
  DataSnapshot,
  runTransaction,
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
  const docIds = `${startDay}_${selectStartTime}_${selectTrainType}_${startStationForView}_${endStationForView}`;

  // 선택된 좌석 수
  const selectedCount = Object.values(seatsState).filter(Boolean).length;

  // 각 호차별 실시간 좌석 상태
  useEffect(() => {
    if (!trainNo || !docIds) return;

    let isMounted = true;
    let unsub: (() => void) | null = null;

    const loadSeatsData = async () => {
      try {
        const seatsQuery = query(
          collection(db, 'train', docIds, 'no', trainNo, 'seats'),
          orderBy('createAt', 'asc'),
        );

        const initialSnapshot = await getDocs(seatsQuery);

        if (!isMounted) return;

        const processSeats = (
          snap: QuerySnapshot<DocumentData, DocumentData>,
        ) => {
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
        };

        // 초기 데이터 처리
        processSeats(initialSnapshot);

        unsub = onSnapshot(
          seatsQuery,
          (snap) => {
            if (!isMounted) return;
            processSeats(snap);
          },
          (error) => {
            console.log('좌석 상태 실시간 조회 오류:', error);
            if (isMounted) {
              setSeatsInfo([]);
            }
          },
        );
      } catch (error) {
        console.error('좌석 데이터 로드 오류:', error);
        if (isMounted) {
          setSeatsInfo([]);
        }
      }
    };
    // 디바운싱 적용
    const timeoutId = setTimeout(loadSeatsData, 200);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (unsub) {
        unsub();
      }
    };
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
                  endStationForView: data.endStationForView,
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
  }, [trainNo]);

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

  // 좌석 잠금 (트랜잭션을 사용한 원자적 잠금 시도)
  const lockSeat = async (seatId: string): Promise<boolean> => {
    if (!user) return false;
    const seatLockRef = ref(realtimeDb, `locks/${docIds}/${trainNo}/${seatId}`);

    try {
      const result = await runTransaction(seatLockRef, (currentData) => {
        // 현재 잠금 상태 확인
        // null이거나 undefined이거나 본인이 잠금한 경우에만 잠금 가능
        if (
          currentData === null ||
          currentData === undefined ||
          currentData === user.uid
        ) {
          return user.uid;
        }
        // 다른 사용자가 이미 잠금한 경우, 현재 값을 유지 (트랜잭션 실패)
        return currentData;
      });

      // 트랜잭션이 성공하고 본인이 잠금한 경우
      if (result.committed && result.snapshot.val() === user.uid) {
        // 브라우저가 닫히면 자동 해제
        onDisconnect(seatLockRef).remove();
        return true;
      }

      return false;
    } catch (error) {
      console.error('좌석 잠금 트랜잭션 오류:', error);
      return false;
    }
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
      // 선택할려는 좌석이 이미 예매된 좌석(본인 포함)이면 선택 불가
      const isMineOrOthers = seatsInfo.some(
        (item) => item.trainNoId === trainNo && item.seatId === id,
      );
      if (isMineOrOthers) return;

      const isSelected = seatsState[id] === true;

      // 선택한 좌석을 다시 선택하면 빈 좌석으로 바뀐다.
      if (isSelected) {
        // 본인이 잠금한 경우에만 해제
        setSeatsState({ ...seatsState, [id]: false });
        await unlockSeat(id);
        return;
      }

      // 선택 인원 수 제한
      if (selectedCount >= selectAdult + selectKid) return;

      // 잠금을 먼저 시도하고, 성공한 경우에만 로컬 상태 업데이트
      const lockSuccess = await lockSeat(id);
      if (lockSuccess) {
        // 잠금 성공 시에만 로컬 상태 업데이트
        setSeatsState({ ...seatsState, [id]: true });
      }
    } finally {
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
    const columns = [1, 2, 3, 4, 5, 6];

    // 사용 가능한 좌석 확인 함수
    const isAvailable = (seatId: string): boolean => {
      return (
        !reservedSeatIds.includes(seatId) &&
        !lockedSeatIds.includes(seatId) &&
        !seatsState[seatId]
      );
    };

    let selectedSeatIds: string[] = [];

    // 2인: 같은 열에서 인접한 두 행 (예: A1 B1)
    if (isAllSelectedCount === 2) {
      for (const col of columns) {
        // A-B 쌍
        const seatA = `A${col}`;
        const seatB = `B${col}`;
        if (isAvailable(seatA) && isAvailable(seatB)) {
          selectedSeatIds = [seatA, seatB];
          break;
        }
        // B-C 쌍
        const seatB2 = `B${col}`;
        const seatC = `C${col}`;
        if (isAvailable(seatB2) && isAvailable(seatC)) {
          selectedSeatIds = [seatB2, seatC];
          break;
        }
        // C-D 쌍
        const seatC2 = `C${col}`;
        const seatD = `D${col}`;
        if (isAvailable(seatC2) && isAvailable(seatD)) {
          selectedSeatIds = [seatC2, seatD];
          break;
        }
      }
    }
    // 3인: ㄱ자 형태 (예: A1 B1 A2)
    else if (isAllSelectedCount === 3) {
      for (const col of columns) {
        // 다음 열이 있는지 확인
        if (col >= 6) continue;

        // A1 B1 A2 형태
        const seatA1 = `A${col}`;
        const seatB1 = `B${col}`;
        const seatA2 = `A${col + 1}`;
        if (isAvailable(seatA1) && isAvailable(seatB1) && isAvailable(seatA2)) {
          selectedSeatIds = [seatA1, seatB1, seatA2];
          break;
        }

        // B1 C1 B2 형태
        const seatB1_2 = `B${col}`;
        const seatC1 = `C${col}`;
        const seatB2 = `B${col + 1}`;
        if (
          isAvailable(seatB1_2) &&
          isAvailable(seatC1) &&
          isAvailable(seatB2)
        ) {
          selectedSeatIds = [seatB1_2, seatC1, seatB2];
          break;
        }

        // C1 D1 C2 형태
        const seatC1_2 = `C${col}`;
        const seatD1 = `D${col}`;
        const seatC2 = `C${col + 1}`;
        if (
          isAvailable(seatC1_2) &&
          isAvailable(seatD1) &&
          isAvailable(seatC2)
        ) {
          selectedSeatIds = [seatC1_2, seatD1, seatC2];
          break;
        }

        // A1 B1 B2 형태 (다른 ㄱ자 형태)
        const seatA1_2 = `A${col}`;
        const seatB1_3 = `B${col}`;
        const seatB2_2 = `B${col + 1}`;
        if (
          isAvailable(seatA1_2) &&
          isAvailable(seatB1_3) &&
          isAvailable(seatB2_2)
        ) {
          selectedSeatIds = [seatA1_2, seatB1_3, seatB2_2];
          break;
        }
      }
    }
    // 4인: ㅁ자 형태 2x2 정사각형 (예: A1 B1 A2 B2)
    else if (isAllSelectedCount === 4) {
      for (const col of columns) {
        // 다음 열이 있는지 확인
        if (col >= 6) continue;

        // A1 B1 A2 B2 형태
        const seatA1 = `A${col}`;
        const seatB1 = `B${col}`;
        const seatA2 = `A${col + 1}`;
        const seatB2 = `B${col + 1}`;
        if (
          isAvailable(seatA1) &&
          isAvailable(seatB1) &&
          isAvailable(seatA2) &&
          isAvailable(seatB2)
        ) {
          selectedSeatIds = [seatA1, seatB1, seatA2, seatB2];
          break;
        }

        // B1 C1 B2 C2 형태
        const seatB1_4 = `B${col}`;
        const seatC1_3 = `C${col}`;
        const seatB2_3 = `B${col + 1}`;
        const seatC2 = `C${col + 1}`;
        if (
          isAvailable(seatB1_4) &&
          isAvailable(seatC1_3) &&
          isAvailable(seatB2_3) &&
          isAvailable(seatC2)
        ) {
          selectedSeatIds = [seatB1_4, seatC1_3, seatB2_3, seatC2];
          break;
        }

        // C1 D1 C2 D2 형태
        const seatC1_4 = `C${col}`;
        const seatD1_2 = `D${col}`;
        const seatC2_2 = `C${col + 1}`;
        const seatD2 = `D${col + 1}`;
        if (
          isAvailable(seatC1_4) &&
          isAvailable(seatD1_2) &&
          isAvailable(seatC2_2) &&
          isAvailable(seatD2)
        ) {
          selectedSeatIds = [seatC1_4, seatD1_2, seatC2_2, seatD2];
          break;
        }
      }
    }
    // 5인 이상: 최대한 붙어있는 형태로 선택 (우선순위: 2x2 + 추가 좌석)
    else {
      // 먼저 4개를 ㅁ자 형태로 찾고, 나머지를 최대한 가까운 곳에 배치
      for (const col of columns) {
        if (col >= 6) continue;

        const seatA1 = `A${col}`;
        const seatB1 = `B${col}`;
        const seatA2 = `A${col + 1}`;
        const seatB2 = `B${col + 1}`;

        if (
          isAvailable(seatA1) &&
          isAvailable(seatB1) &&
          isAvailable(seatA2) &&
          isAvailable(seatB2)
        ) {
          selectedSeatIds = [seatA1, seatB1, seatA2, seatB2];

          // 나머지 좌석을 최대한 가까운 곳에 배치
          const remaining = isAllSelectedCount - 4;
          if (remaining > 0) {
            // 같은 행의 다음 열이나 이전 열 시도
            const candidates = [
              `A${col + 2}`,
              `B${col + 2}`,
              `A${col - 1}`,
              `B${col - 1}`,
              `C${col}`,
              `C${col + 1}`,
            ].filter((id) => {
              const match = id.match(/^([A-D])(\d+)$/);
              if (!match) return false;
              const row = match[1];
              const colNum = parseInt(match[2]);
              return (
                rows.includes(row) &&
                colNum >= 1 &&
                colNum <= 6 &&
                isAvailable(id) &&
                !selectedSeatIds.includes(id)
              );
            });

            for (let i = 0; i < remaining && i < candidates.length; i++) {
              selectedSeatIds.push(candidates[i]);
            }
          }

          if (selectedSeatIds.length === isAllSelectedCount) break;
        }
      }
    }

    // 패턴으로 찾지 못한 경우, 기존 랜덤 방식으로 fallback
    if (selectedSeatIds.length < isAllSelectedCount) {
      selectedSeatIds = [];
      const allRows = ['A', 'B', 'C', 'D'];
      const allColumns = [1, 2, 3, 4, 5, 6];

      // 모든 사용 가능한 좌석 목록 생성
      const availableSeats: string[] = [];
      for (const row of allRows) {
        for (const col of allColumns) {
          const seatId = `${row}${col}`;
          if (isAvailable(seatId)) {
            availableSeats.push(seatId);
          }
        }
      }

      // 필요한 만큼 랜덤 선택
      while (
        selectedSeatIds.length < isAllSelectedCount &&
        availableSeats.length > 0
      ) {
        const randomIndex = Math.floor(Math.random() * availableSeats.length);
        selectedSeatIds.push(availableSeats[randomIndex]);
        availableSeats.splice(randomIndex, 1);
      }
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
        .filter(([, value]) => value === true)
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

  const createSelectedSeats = async (calculatedPay: number) => {
    if (!user) return;
    if (isMutating) return;
    setIsMutating(true);

    const filtered = Object.entries(seatsState)
      .filter(([, value]) => value === true)
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
            selectPay: calculatedPay,
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
