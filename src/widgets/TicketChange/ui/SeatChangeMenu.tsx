import down from '@/assets/icons/down.png';
import { seatsChangeInfoStore } from '@/features/TicketChange/models/seatsChangeInfoStore';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import useModalStore from '@/widgets/model/TicketChangeStore';

const SeatChangeMenu = () => {
  const { openModal } = useModalStore();
  const { trainNo } = trainDataStore();
  const { seatsChangeInfo } = seatsChangeInfoStore();

  const trainNoSeatsCount = seatsChangeInfo.map(
    (item) => item.trainNoId === trainNo,
  ).length;

  return (
    <div className="mt-[15px] flex w-full justify-end">
      <div
        onClick={() => {
          openModal('TrainNumberChoiceModal');
        }}
        className="flex h-[30px] w-[150px] cursor-pointer items-center justify-center gap-[6px] rounded-xs border border-lightGray bg-white shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95"
      >
        <span className="text-xs font-bold">
          {trainNo}호차 잔여{' '}
          <span className="text-blue">{trainNoSeatsCount}</span>석/24석
        </span>
        <img src={down} width={11} height={7} />
      </div>
    </div>
  );
};

export default SeatChangeMenu;
