import { auth } from '@/shared/firebase/firebase';
import { seatsStateStore } from '../models/seatsStateStore';
import { useSeatsGroupInfo } from '@/features/TicketChange/hooks/useSeatsGroupInfo';
import { groupSeatsStore } from '@/widgets/TicketList/model/groupSeatsStore';
import { seatsChangeInfoStore } from '../models/seatsChangeInfoStore';
import { seatsChangeTargetStore } from '../models/seatsChangeTargetStore';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import { useMixSeats } from './useMixSeats';

export const useSeatsSelect = () => {
  const { seatsState, setSeatsState } = seatsStateStore();
  const { groupedArray } = useSeatsGroupInfo() || {};
  const { groupSeats } = groupSeatsStore();
  const { seatsChangeInfo } = seatsChangeInfoStore();
  const { setSeatsChangeTarget, setIsSeatsChangeTarget } =
    seatsChangeTargetStore();
  const { trainNo } = trainDataStore();
  const { seatsChangeMixTargetOrAllTarget } = useMixSeats();

  const user = auth.currentUser;

  const selectedCount = Object.values(seatsState).filter(Boolean).length;

  const handleSeatsSelect = (id: string) => {
    if (!user) return;

    // 변경할려는 좌석의 수와 동일하거나 그보다 적은 타 좌석
    const filteredGroupSeats = groupedArray.filter(
      (item) => item.length <= groupSeats.length,
    );

    // 선택한 각 좌석
    const eachSeat = seatsChangeInfo.filter((item) => item.seatId === id);

    // 선택한 좌석이 동일한 생성 시간인 좌석들
    const selectedGroupSeatsByTime = filteredGroupSeats
      .flat()
      .filter((item) => {
        const isTarget = eachSeat[0]?.createAt ?? 0;
        return item.createAt === isTarget;
      });

    // 내 좌석이지만 다른 승차권인 좌석
    const mySeatsNotInThisTicket = seatsChangeInfo
      .filter((item) => item.userId === user?.uid)
      .filter((item) => groupSeats[0].createAt !== item.createAt);

    // 현재 사용자의 좌석들이지만 해당 승차권의 좌석이 아닌 좌석이 하나라도 있으면 선택 금지
    if (
      selectedGroupSeatsByTime.filter((item) =>
        mySeatsNotInThisTicket.includes(item),
      ).length > 0
    ) {
      return;
    }
    setSeatsChangeTarget(selectedGroupSeatsByTime);

    // 선택한 좌석과 내 좌석의 개수가 동일하면 true 그렇지 않으면 false
    if (selectedGroupSeatsByTime.length === groupSeats.length) {
      setIsSeatsChangeTarget(true);
      return;
    }
    setIsSeatsChangeTarget(false);

    // 사용자(본인)이 이미 누른 좌석이면서 호차를 클릭한 경우(중복 제거)
    const isMine = seatsChangeInfo.some(
      (item) =>
        item.trainNoId === trainNo &&
        item.seatId === id &&
        item.userId === user.uid,
    );

    if (isMine) {
      return;
    }

    // 다른 사용자가 이미 선택된 좌석이면서 호차를 클릭한 경우(중복 제거)
    const isOther = seatsChangeInfo.some(
      (item) =>
        item.trainNoId === trainNo &&
        item.seatId === id &&
        item.userId !== user.uid,
    );

    if (isOther) {
      return;
    }

    const isSelected = seatsState[id] === true;

    // 선택한 좌석과 각 티켓의 예매된 좌석 수가 동일하거나 또는 내 예매 좌석과 (빈 좌석 + 상대방 좌석)의 개수가 동일하면 더 이상 선택이 안되지만,
    // 선택된 좌석을 다시 선택하면 빈 좌석으로 바뀐다.
    if (
      selectedCount === groupSeats.length ||
      groupSeats.length === seatsChangeMixTargetOrAllTarget.length
    ) {
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
  return { handleSeatsSelect };
};
