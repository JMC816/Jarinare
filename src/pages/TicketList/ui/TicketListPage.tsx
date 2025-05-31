import MiniTicket from '@/widgets/TicketList/ui/MiniTicket';

const TickListPage = () => {
  return (
    <div className="flex w-full flex-col items-center overflow-scroll pl-[28px] pr-[27px]">
      <span className="mt-5 w-full text-lg font-bold">내 승차권</span>
      <div className="mt-5 flex flex-col gap-y-5 overflow-y-auto">
        <MiniTicket />
      </div>
    </div>
  );
};

export default TickListPage;
