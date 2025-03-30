import MiniTicket from '@/widgets/TicketList/ui/MiniTicket';

const TickListPage = () => {
  return (
    <div className="flex flex-col items-center overflow-scroll pl-[28px] pr-[27px]">
      <span className="mt-5 w-full text-lg font-bold">내 승차권</span>
      <div className="mt-5 flex flex-col gap-y-5 overflow-y-auto">
        <MiniTicket
          startDay="출발 2월 23일 (일)"
          startStation="서울"
          startTime="오후 8시 32분"
          endStation="대전"
          endTime="오후 11시 32분"
          trainName="KTX 산천 201"
        />
        <MiniTicket
          startDay="출발 2월 23일 (일)"
          startStation="서울"
          startTime="오후 8시 32분"
          endStation="대전"
          endTime="오후 11시 32분"
          trainName="KTX 산천 201"
        />
        <MiniTicket
          startDay="출발 2월 23일 (일)"
          startStation="서울"
          startTime="오후 8시 32분"
          endStation="대전"
          endTime="오후 11시 32분"
          trainName="KTX 산천 201"
        />
        <MiniTicket
          startDay="출발 2월 23일 (일)"
          startStation="서울"
          startTime="오후 8시 32분"
          endStation="대전"
          endTime="오후 11시 32분"
          trainName="KTX 산천 201"
        />
        <MiniTicket
          startDay="출발 2월 23일 (일)"
          startStation="서울"
          startTime="오후 8시 32분"
          endStation="대전"
          endTime="오후 11시 32분"
          trainName="KTX 산천 201"
        />
        <MiniTicket
          startDay="출발 2월 23일 (일)"
          startStation="서울"
          startTime="오후 8시 32분"
          endStation="대전"
          endTime="오후 11시 32분"
          trainName="KTX 산천 201"
        />
      </div>
    </div>
  );
};

export default TickListPage;
