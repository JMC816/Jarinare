import { TicketListProps } from '../types/Ticket';

const TicketList = ({ title, text, textColor }: TicketListProps) => {
  return (
    <div className="flex justify-between text-base font-bold">
      <span className="text-mediumGray">{title}</span>
      <span className={`text-${textColor}`}>{text}</span>
    </div>
  );
};

export default TicketList;
