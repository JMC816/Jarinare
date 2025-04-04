import useModalStore from '@/widgets/model/ReserveStore';
import Modal from '@/widgets/TicketReserve/ui/Modal';
import TrainCheckMenu from '@/widgets/TicketReserve/ui/TrainCheckMenu';
import TrainCheckTitle from '@/widgets/TicketReserve/ui/TrainCheckTitle';
import TrainList from '@/widgets/TicketReserve/ui/TrainList';

const TrainCheckPage = () => {
  const { isShow, modalType } = useModalStore();
  return (
    <div className="flex w-full flex-col items-center overflow-y-hidden pl-[28px] pr-[27px]">
      <TrainCheckTitle />
      <TrainCheckMenu />
      <TrainList />
      {isShow == false || modalType == undefined ? null : <Modal />}
    </div>
  );
};

export default TrainCheckPage;
