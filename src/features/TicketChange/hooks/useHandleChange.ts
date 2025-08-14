import { useMixSeats } from './useMixSeats';
import { useOccupiedSeats } from './useOccupiedSeats';
import { DataSnapshot } from 'firebase/database';
import { SeatType } from '@/entities/Seat/types/seatType';
import { responesBySeatIdTrainNoIdStore } from '@/features/Notification/models/responseBySeatIdAndTrainNoIdStore';

export const useHandleChange = () => {
  const { occupiedSeatsChange } = useOccupiedSeats();
  const { mixSeatsChange } = useMixSeats();
  const { seatIdsAndTrainNoId } = responesBySeatIdTrainNoIdStore();

  // keepSeats : 바꿀 좌석들(빈 좌석 선택시 이전에 선택한 기존 좌석으로 업데이트)
  // seatsChangeTarget : 바꿀 좌석들(빈 좌석도 포함된다)
  // isSeatsChangeTarget: 좌석이 있으면 true, 빈 좌석이면 false
  const handleClick = async (response: DataSnapshot) => {
    const keys = Object.keys(response.val());

    const filteredKey = keys.filter((item) =>
      item.includes(
        `${seatIdsAndTrainNoId[0].trainNoId}_${seatIdsAndTrainNoId[0].seatId}`,
      ),
    );

    const mySeats = response.val()[filteredKey[0]].mySeat as SeatType[];

    const seatsChangeTarget = response.val()[filteredKey[0]]
      .targetSeat as SeatType[];

    const newKeepSeats = response.val()[filteredKey[0]].keepSeats as SeatType[];

    const emptySeatsTarget = response.val()[filteredKey[0]]
      .emptySeatsTarget as string[];

    const mixSeatId = response.val()[filteredKey[0]].mixTarget
      .seatsChangeMixTargetSeatId as string[];

    const isSeatsChangeTarget = response.val()[filteredKey[0]]
      .isSeatsChangeTarget as boolean;

    if (
      mySeats.length > newKeepSeats.length &&
      newKeepSeats.length !== 0 &&
      isSeatsChangeTarget === false
    ) {
      return await mixSeatsChange(
        emptySeatsTarget,
        mySeats,
        newKeepSeats,
        mixSeatId,
      );
    }
    if (
      mySeats.length === seatsChangeTarget.length &&
      isSeatsChangeTarget === true
    ) {
      return await occupiedSeatsChange(mySeats, seatsChangeTarget);
    }
  };
  return { handleClick };
};
