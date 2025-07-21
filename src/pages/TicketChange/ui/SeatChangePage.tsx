import { useEmptySeats } from '@/features/TicketChange/hooks/useEmptySeats';
import { useMixSeats } from '@/features/TicketChange/hooks/useMixSeats';
import { useOccupiedSeats } from '@/features/TicketChange/hooks/useOccupiedSeats';
import { seatsChangeTargetStore } from '@/features/TicketChange/models/seatsChangeTargetStore';
import { seatsTargetStore } from '@/features/TicketChange/models/seatsTargetStore';
import useModalStore from '@/widgets/model/TicketChangeStore';
import Modal from '@/widgets/TicketChange/ui/Modal';
import SeatChangeButton from '@/widgets/TicketChange/ui/SeatChangeButton';
import SeatChangeList from '@/widgets/TicketChange/ui/SeatChangeList';
import SeatChangeMenu from '@/widgets/TicketChange/ui/SeatChangeMenu';
import SeatChangeState from '@/widgets/TicketChange/ui/SeatChangeState';
import { groupSeatsStore } from '@/widgets/TicketList/model/groupSeatsStore';

const SeatChangePage = () => {
  const { isShow, modalType, openModal } = useModalStore();
  const { emptySeatsChange } = useEmptySeats();
  const { occupiedSeatsChange } = useOccupiedSeats();
  const { mixSeatsChange, keepSeats } = useMixSeats();
  const { groupSeats } = groupSeatsStore();
  const { isSeatsChangeTarget, seatsChangeTarget } = seatsChangeTargetStore();
  const { seatsTarget } = seatsTargetStore();

  // keepSeats : 바꿀 좌석들(빈 좌석 선택시 이전에 선택한 기존 좌석으로 업데이트)
  // seatsChangeTarget : 바꿀 좌석들(빈 좌석도 포함된다)
  // isSeatsChangeTarget: 좌석이 있으면 true, 빈 좌석이면 false
  const handleClick = () => {
    if (
      groupSeats.length > keepSeats.length &&
      keepSeats.length !== 0 &&
      isSeatsChangeTarget === false
    ) {
      console.log('mix');
      return mixSeatsChange();
    }
    if (
      groupSeats.length === seatsChangeTarget.length &&
      isSeatsChangeTarget === true
    ) {
      console.log('occup');
      return occupiedSeatsChange();
    }
    if (seatsChangeTarget.length === 0 && isSeatsChangeTarget === false) {
      console.log('empty');
      return emptySeatsChange();
    }
  };

  // 현재 승차권 안에 있는 내 좌석들(내 좌석들 중 다른 승차권에 포함된 좌석은 제외)
  const mySeatsInThisTicket =
    groupSeats.filter((item) =>
      seatsChangeTarget.some(
        (i) => i.seatId === item.seatId && i.trainNoId === item.trainNoId,
      ),
    ).length > 0;

  const isAllSelected = seatsTarget.length === groupSeats.length ? true : false;

  return (
    <div className="flex w-full flex-col items-center pl-[28px] pr-[27px]">
      <SeatChangeMenu />
      <SeatChangeList />
      <SeatChangeState />
      <div className="mt-[10px] flex justify-between gap-x-5">
        <span className="h-12 w-[150px] text-base font-bold text-mediumGray">
          빈 좌석 또는 타 승객 좌석을 선택해주세요
        </span>
        <SeatChangeButton
          onClick={() => {
            if (mySeatsInThisTicket) {
              return;
            }
            if (groupSeats.length === seatsTarget.length) {
              openModal('SeatChangeModal');
            }
            // handleClick();
          }}
          text={`${seatsTarget.length} / ${groupSeats.length} 선택`}
          textColor="white"
          bgColor={
            isAllSelected && !mySeatsInThisTicket
              ? 'blue'
              : 'lightBlueImpossible'
          }
        />
      </div>
      {isShow == false || modalType == undefined ? null : <Modal />}
    </div>
  );
};

export default SeatChangePage;
