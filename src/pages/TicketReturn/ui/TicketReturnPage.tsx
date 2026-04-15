import BackWardPageButton from '@/widgets/layouts/ui/BackWardPageButton';
import MiniTicket from '@/widgets/TicketReturn/ui/MiniTicket';

const TicketReturnPage = () => {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-gray-100 pl-[28px] pr-[27px]">
      <BackWardPageButton />
      <span className="mt-5 w-full text-lg font-bold">내 승차권</span>
      <div className="mt-5 flex w-full flex-col gap-y-5 pb-[100px]">
        <MiniTicket />
      </div>
    </div>
  );
};

export default TicketReturnPage;
