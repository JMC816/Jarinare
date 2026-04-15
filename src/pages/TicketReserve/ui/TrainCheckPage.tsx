import BackWardPageButton from '@/widgets/layouts/ui/BackWardPageButton';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import useModalStore from '@/widgets/model/ReserveStore';
import Modal from '@/widgets/TicketReserve/ui/Modal';
import TrainCheckMenu from '@/widgets/TicketReserve/ui/TrainCheckMenu';
import TrainCheckTitle from '@/widgets/TicketReserve/ui/TrainCheckTitle';
import TrainList from '@/widgets/TicketReserve/ui/TrainList';

const TrainCheckPage = () => {
  const { isShow, modalType } = useModalStore();
  const { startDayForView } = trainDataStore();

  return (
    <div className="flex min-h-screen w-full flex-col items-center overflow-y-hidden bg-gray-100 pl-[28px] pr-[27px]">
      <BackWardPageButton title="열차 조회" />
      <div className="mt-4 w-full">
        <span className="text-xs text-gray-400">출발 날짜</span>
        <p className="text-lg font-bold text-gray-900">{startDayForView}</p>
      </div>
      <TrainCheckTitle />
      <TrainCheckMenu />
      <TrainList />
      {isShow == false || modalType == undefined ? null : <Modal />}
    </div>
  );
};

export default TrainCheckPage;
