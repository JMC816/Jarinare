import TicketList from './TicketList';

const Ticket = () => {
  return (
    <div className="flex w-full flex-col gap-y-[40px]">
      <TicketList title="시간" text="오전 5:03 - 오전 6:02" textColor="blue" />
      <TicketList title="출발" text="02월 28일" textColor="blue" />
      <TicketList title="기차" text="KTX-산천 201" textColor="black" />
      <TicketList title="호차" text="1호차 2A • 1호차 2B" textColor="black" />
      <TicketList title="인원" text="어른 1명 • 어린이 1명" textColor="black" />
      <div className="w-full border border-lightGray" />
      <TicketList title="요금" text="23,400원" textColor="black" />
    </div>
  );
};

export default Ticket;
