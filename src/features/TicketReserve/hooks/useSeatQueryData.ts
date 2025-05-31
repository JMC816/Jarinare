import { auth, db } from '@/shared/firebase/firebase';
import {
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { trainDataStore } from '../model/trainDataStore';
import { useEffect, useState } from 'react';
import { SeatType } from '@/entities/Seat/types/seatType';
import { seatsStateStore } from '../model/seatsStateStore';
import { seatsStateCountStore } from '../model/seatsStateCountStore';
import { useNavigate } from 'react-router-dom';
import { formatTodayDate } from '@/shared/lib/formatDate';
import { seatsInfoStore } from '../model/seatsInfoStore';

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
  const [userSeats, setUserSeats] = useState<SeatType[]>([]);
  const { seatsStateCount, setSeatsStateCount } = seatsStateCountStore();
  const [isAutoSelected, setIsAutoSelected] = useState(false);

  const navigate = useNavigate();

  const user = auth.currentUser;
  const docId = `${startDay}_${selectStartTime}_${selectTrainType}`;
  const trainNoId = `${trainNo}`;

  // 선택된 좌석 수
  const selectedCount = Object.values(seatsState).filter(Boolean).length;

  useEffect(() => {
    // 선택한 좌석 즉시 반영
    setSeatsStateCount(selectedCount);

    // 선택한 좌석들을 취소하면 다시 선택 가능
    if (selectedCount === 0) {
      setIsAutoSelected(false);
    }
  }, [seatsState]);

  // 좌석 정보
  useEffect(() => {
    const getSeats = async () => {
      const seatsQuery = query(
        collection(db, 'train', docId, 'no', trainNoId, 'seats'),
        orderBy('createAt'),
      );

      // db에 있는 seats 컬렉션을 가져온다.
      const existSeats = await getDocs(seatsQuery);

      const seats = existSeats.docs.map((doc) => {
        const data = doc.data();
        return {
          seatId: data.seatId,
          userId: data.userId,
          trainNoId: data.trainNoId,
          startDay: data.startDay,
          startTime: data.startTime,
          endTime: data.endTime,
          trainType: data.trainType,
          createAt: data.createAt.seconds,
          startDayForView: data.startDayForView,
          startStationForView: data.startStationForView,
          endStationForView: data.endSatationForView,
          id: doc.id,
        };
      });
      setSeatsInfo(seats);

      // 호차 변경될 때 좌석 선택 초기화
      setSeatsState({});
    };
    getSeats();
  }, [trainNo]);

  useEffect(() => {
    const getAllSeats = async () => {
      const trainNos = ['1', '2', '3', '4'];

      // 모든 호차의 좌석 개수
      let allSeats: SeatType[] = [];

      try {
        await Promise.all(
          trainNos.map(async (trainNoId) => {
            const seatsQuery = query(
              collection(db, 'train', docId, 'no', trainNoId, 'seats'),
              orderBy('createAt'),
            );

            const existSeats = await getDocs(seatsQuery);
            const seats = existSeats.docs.map((doc) => {
              const data = doc.data();
              return {
                seatId: data.seatId,
                userId: data.userId,
                trainNoId: data.trainNoId,
                startDay: data.startDay,
                startTime: data.startTime,
                endTime: data.endTime,
                trainType: data.trainType,
                createAt: data.createAt.seconds,
                startDayForView: data.startDayForView,
                startStationForView: data.startStationForView,
                endStationForView: endStationForView,
                id: doc.id,
              };
            });
            // 각 호차들의 좌석들을 배열에 저장
            allSeats = [...allSeats, ...seats];
          }),
        );
        setSeatAllInfo(allSeats);
      } catch (e) {
        console.log(e);
      }
    };
    getAllSeats();
  }, [trainNo]);

  // 각 기차의 도착 시간이 현재 시간보다 이전일 때 해당 좌석 제거
  useEffect(() => {
    const deleteSeats = async () => {
      const filtered = seatsInfo.filter(
        (item) => item.endTime < formatTodayDate(),
      );
      try {
        await Promise.all(
          filtered.map((seat) => {
            deleteDoc(
              doc(
                db,
                'train',
                docId,
                'no',
                seat.trainNoId,
                'seats',
                seat.seatId,
              ),
            );
          }),
        );
      } catch (e) {
        console.log(e);
      }
    };
    deleteSeats();
  }, []);

  // 각 사용자의 모든 좌석 데이터를 가져옴
  useEffect(() => {
    const getAllSeatsByUser = async () => {
      if (!user) return;
      try {
        const userSeatsQuery = query(
          collectionGroup(db, 'seats'),
          where('userId', '==', user.uid),
          orderBy('createAt'),
        );

        const querySnapshot = await getDocs(userSeatsQuery);
        const userSeats = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            seatId: data.seatId,
            userId: data.userId,
            trainNoId: data.trainNoId,
            startDay: data.startDay,
            startTime: data.startTime,
            endTime: data.endTime,
            trainType: data.trainType,
            createAt: data.createAt.seconds,
            startDayForView: data.startDayForView,
            startStationForView: data.startStationForView,
            endStationForView: data.endStationForView,
            id: doc.id,
          };
        });
        setUserSeats(userSeats);
      } catch (e) {
        console.error(e);
      }
    };
    getAllSeatsByUser();
  }, []);

  const handleSingleSelect = (id: string) => {
    if (!user) return;

    // 사용자(본인)이 이미 누른 좌석을 클릭한 경우(중복 제거)
    const isMine = seatsInfo.some(
      (item) => item.seatId === id && item.userId === user.uid,
    );

    if (isMine) {
      return;
    }

    // 다른 사용자가 이미 선택된 좌석을 클릭한 경우(중복 제거)
    const isOther = seatsInfo.some(
      (item) => item.seatId === id && item.userId !== user.uid,
    );

    if (isOther) {
      return;
    }

    const isSelected = seatsState[id] === true;

    // 선택한 좌석과 인원 수가 동일하면 더 이상 선택 안되지만,
    // 선택된 좌석을 다시 선택하면 빈 좌석으로 바뀐다.
    if (selectedCount === selectAdult + selectKid) {
      if (isSelected) {
        setSeatsState({ ...seatsState, [id]: false });
        return;
      }
      return;
    }

    // 선택한 좌석을 다시 선택하면 빈 좌석으로 바뀐다.
    if (isSelected) {
      setSeatsState({ ...seatsState, [id]: false });
      return;
    }
    // 빈 좌석을 선택하면 선택한 좌석으로 바뀐다.
    setSeatsState({ ...seatsState, [id]: true });
  };

  const handleAllSelect = () => {
    if (isAutoSelected) return;

    // 단일로 선택된 좌석이 있으면 단체 선택 막기
    const reservedSeats = Object.values(seatsState).some(
      (seatState) => seatState === true,
    );
    if (reservedSeats) return;

    // 빈 좌석이 선택할 좌석 만큼 없으면 선택 막기
    const reservedSeatIds = seatsInfo.map((id) => id.seatId);

    const isAllSelectedCount = selectKid + selectAdult;
    if (24 - reservedSeatIds.length < isAllSelectedCount) return;

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

      // 이미 선택했거나 예약된 좌석은 제외
      if (isAlreadySelected || isReserved) continue;

      selectedSeatIds.push(seatId);

      // 이중 선택 막기
      setIsAutoSelected(true);
    }

    // 순회한 좌석들을 newState에 저장
    const multipleSeatsState = { ...seatsState };
    selectedSeatIds.forEach((id) => {
      multipleSeatsState[id] = true;
    });
    // 여러 좌석들을 한 번에 선택
    setSeatsState(multipleSeatsState);
  };

  const createSelectedSeats = async () => {
    if (!user) return;

    // 좌석 id가 true인 것만 추출
    const filtered = Object.entries(seatsState)
      .filter(([_, value]) => value === true)
      .map(([key]) => key);
    try {
      // firestore에 좌석 데이터 저장
      await Promise.all(
        filtered.map((seatId) => {
          setDoc(doc(db, 'train', docId, 'no', trainNoId, 'seats', seatId), {
            userId: user.uid,
            seatId,
            trainNoId,
            startDay,
            startTime: selectStartTime,
            endTime: selectEndTime,
            trainType: selectTrainType,
            createAt: new Date(),
            startDayForView,
            startStationForView,
            endStationForView,
          });
        }),
      );
      navigate('/');
    } catch (e) {
      console.log(e);
    }
  };
  return {
    handleSingleSelect,
    handleAllSelect,
    createSelectedSeats,
    userSeats,
    seatsState,
    seatsInfo,
    seatsAllInfo,
    seatsStateCount,
  };
};
