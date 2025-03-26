import TrainCheckMenu from '@/widgets/TicketReserve/ui/TrainCheckMenu';
import TrainCheckTitle from '@/widgets/TicketReserve/ui/TrainCheckTitle';
import TrainList from '@/widgets/TicketReserve/ui/TrainList';

const TrainCheckPage = () => {
  return (
    <div className="flex w-full flex-col items-center overflow-y-hidden pl-[28px] pr-[27px]">
      <TrainCheckTitle />
      <TrainCheckMenu />
      <TrainList />
    </div>
  );
};

export default TrainCheckPage;
