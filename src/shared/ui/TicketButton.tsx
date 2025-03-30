import { TicketButtonProps } from '../types/Ticket';

const TicketButton = ({
  text,
  bgColor,
  textColor,
  onClick,
}: TicketButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`h-12 w-[300px] rounded-xs bg-${bgColor} text-base font-bold text-${textColor} active:brightness-50`}
    >
      {text}
    </button>
  );
};

export default TicketButton;
