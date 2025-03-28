import SeatCheckButton from '@/widgets/TicketReserve/ui/SeatCheckButton';
import SeatCheckList from '@/widgets/TicketReserve/ui/SeatCheckList';
import SeatCheckMenu from '@/widgets/TicketReserve/ui/SeatCheckMenu';
import SeatCheckState from '@/widgets/TicketReserve/ui/SeatCheckState';

const SeatCheckPage = () => {
  return (
    <div className="flex w-full flex-col items-center pl-[28px] pr-[27px]">
      <SeatCheckMenu />
      <SeatCheckList />
      <SeatCheckState />
      <div className="mt-[10px] flex justify-between gap-x-5">
        <SeatCheckButton
          text="자동 좌석 선택"
          textColor="white"
          bgColor="blue"
        />
        <SeatCheckButton
          text="0 / 2 선택"
          textColor="black"
          bgColor="lightGray"
        />
      </div>
    </div>
  );
};

export default SeatCheckPage;
