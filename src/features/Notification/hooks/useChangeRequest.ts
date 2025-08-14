import { useEmptySeats } from '@/features/TicketChange/hooks/useEmptySeats';
import { seatsChangeInfoStore } from '@/features/TicketChange/models/seatsChangeInfoStore';
import { seatsChangeMixTargetSeatIdStore } from '@/features/TicketChange/models/seatsChangeMixTargetSeatIdStore';
import { seatsChangeTargetStore } from '@/features/TicketChange/models/seatsChangeTargetStore';
import { seatsStateStore } from '@/features/TicketChange/models/seatsStateStore';
import { shareKeepSeatsStore } from '@/features/TicketChange/models/shareKeepSeatsStore';
import { realtimeDb } from '@/shared/firebase/firebase';
import { groupSeatsStore } from '@/widgets/TicketList/model/groupSeatsStore';
import { ref, set } from 'firebase/database';

export const useChangeRequest = () => {
  const { groupSeats } = groupSeatsStore();
  const { seatsChangeInfo } = seatsChangeInfoStore();
  const { shareKeepSeats } = shareKeepSeatsStore();
  const { isSeatsChangeTarget } = seatsChangeTargetStore();
  const { seatsState } = seatsStateStore();
  const { emptySeatsChange } = useEmptySeats();
  const { seatsChangeMixTargetSeatId } = seatsChangeMixTargetSeatIdStore();

  // 좌석 id가 true인 것만 추출
  const emptySeatsTarget = Object.entries(seatsState)
    .filter(([_, value]) => value === true)
    .map(([key]) => key);

  // 좌석 변경 요청
  const changeRequset = async (target: string[]) => {
    if (seatsChangeInfo.some((item) => target.includes(item.seatId))) {
      // 변경할 좌석
      const targetSeats = seatsChangeInfo.filter((item) =>
        target.includes(item.seatId),
      );

      await set(
        ref(
          realtimeDb,
          `${targetSeats[0].userId}_change/${groupSeats[0].id}_${groupSeats[0].trainNoId}_${groupSeats.map((item) => item.seatId)}`,
        ),
        {
          mySeat: groupSeats,
          targetSeat: targetSeats,
          keepSeats: shareKeepSeats,
          isSeatsChangeTarget,
          seatIds: groupSeats.map((item) => item.seatId),
          emptySeatsTarget,
          mixTarget: {
            seatsChangeMixTargetSeatId,
            id: targetSeats[0].id,
            trainNoId: targetSeats[0].trainNoId,
          },
        },
      );
    } else {
      emptySeatsChange(emptySeatsTarget);
    }
  };

  return { changeRequset };
};
