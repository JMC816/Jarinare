/**
 * @role: features/hooks
 * @rule: 좌석 변경 클릭 핸들러만 담당. 백엔드 POST /seats/change-requests 사용
 */
import { useMixSeats } from './useMixSeats';
import { useOccupiedSeats } from './useOccupiedSeats';
import { DataSnapshot } from 'firebase/database';
import { SeatType } from '@/entities/Seat/types/seatType';
import { responesBySeatIdTrainNoIdStore } from '@/features/Notification/models/responseBySeatIdAndTrainNoIdStore';
import { useLocation } from 'react-router-dom';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import { createChangeRequest } from '../api/ticketChangeApi';

export const useHandleChange = () => {
  const { occupiedSeatsChange } = useOccupiedSeats();
  const { mixSeatsChange } = useMixSeats();
  const { seatIdsAndTrainNoId } = responesBySeatIdTrainNoIdStore();
  const location = useLocation();
  const { trainNo } = trainDataStore();
  const mySeats: SeatType[] = location.state;

  const handleClick = async (response: DataSnapshot) => {
    if (!mySeats) return;

    const keys = Object.keys(response.val());
    const filteredKey = keys.filter((item) =>
      item.includes(
        `${seatIdsAndTrainNoId[0].trainNoId}_${seatIdsAndTrainNoId[0].seatId}`,
      ),
    );

    const mySeat = response.val()[filteredKey[0]].mySeat as SeatType[];
    const seatsChangeTarget = response.val()[filteredKey[0]].targetSeat as SeatType[];
    const newKeepSeats = response.val()[filteredKey[0]].keepSeats as SeatType[];
    const emptySeatsTarget = response.val()[filteredKey[0]].emptySeatsTarget as string[];
    const mixSeatId = response.val()[filteredKey[0]].mixTarget.seatsChangeMixTargetSeatId as string[];
    const isSeatsChangeTarget = response.val()[filteredKey[0]].isSeatsChangeTarget as boolean;

    const reservationIds = mySeats
      .map((s) => s.reservationId)
      .filter((id): id is number => id !== undefined);

    if (reservationIds.length === 0) return;

    const carNo = Number(trainNo) || 1;

    // 혼합: 내 좌석 수 > 남은 좌석 수이고 빈 좌석 포함
    if (
      mySeat.length > newKeepSeats.length &&
      newKeepSeats.length !== 0 &&
      isSeatsChangeTarget === false
    ) {
      await mixSeatsChange(emptySeatsTarget, mySeat, newKeepSeats, mixSeatId);
      return;
    }

    // 전부 점유 좌석으로 교환
    if (mySeat.length === seatsChangeTarget.length && isSeatsChangeTarget === true) {
      await occupiedSeatsChange(mySeat, seatsChangeTarget);
      return;
    }

    // 전부 빈 좌석으로 이동
    if (emptySeatsTarget.length === mySeat.length) {
      await createChangeRequest(reservationIds, carNo, emptySeatsTarget);
    }
  };

  return { handleClick };
};
