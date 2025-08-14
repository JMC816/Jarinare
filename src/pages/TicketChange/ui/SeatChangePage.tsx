import { useExistChangeRequestBlocked } from '@/features/Notification/hooks/useExistChangeRequestBlocked';
import { useExistMixChangeRequestBlocked } from '@/features/Notification/hooks/useExistMixChangeRequestBlocked';
import { useSeatsChangeBlocked } from '@/features/Notification/hooks/useSeatsChangeBlocked';
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
  const { groupSeats } = groupSeatsStore();
  const { seatsChangeTarget } = seatsChangeTargetStore();
  const { seatsTarget } = seatsTargetStore();
  const { isBlocked } = useSeatsChangeBlocked();
  const { isExistRequestBlocked } = useExistChangeRequestBlocked();
  const { isExistMixRequestBlocked } = useExistMixChangeRequestBlocked();

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
          onClick={async () => {
            if (isExistMixRequestBlocked) {
              return;
            }
            if (isExistRequestBlocked) {
              return;
            }
            if (isBlocked) {
              return;
            }
            if (mySeatsInThisTicket) {
              return;
            }
            if (groupSeats.length === seatsTarget.length) {
              openModal('SeatChangeModal');
            }
          }}
          text={
            isBlocked
              ? '요청 기다리는 중..'
              : `${seatsTarget.length} / ${groupSeats.length} 선택`
          }
          textColor="white"
          bgColor={
            isAllSelected && !mySeatsInThisTicket && !isBlocked
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
