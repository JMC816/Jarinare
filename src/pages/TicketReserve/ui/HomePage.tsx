import Button from '@/shared/ui/Button';
import ReserveTicket from '@/widgets/TicketReserve/ui/ReserveTicket';
import ReserveTitle from '@/widgets/TicketReserve/ui/ReserveTitle';
import ReserveWay from '@/widgets/TicketReserve/ui/ReserveWay';

const HomePage = () => {
  return (
    <div className="flex flex-col items-center">
      <ReserveTitle text="어디로 갈까요?" />
      <ReserveWay />
      <div className="mt-5">
        <Button text="조회" textColor="white" bgColor="blue" />
      </div>
      <ReserveTitle text="내 승차권" />
      <ReserveTicket />
    </div>
  );
};

export default HomePage;
