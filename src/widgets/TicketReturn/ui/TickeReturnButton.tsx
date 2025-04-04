import { TicketButtonProps } from '@/shared/types/TicketType';

const TicketReturnButton = ({
  text,
  bgColor,
  textColor,
  onClick,
}: TicketButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`h-12 w-[100px] rounded-xs bg-${bgColor} text-${textColor} text-base active:brightness-50`}
    >
      {text}
    </button>
  );
};

export default TicketReturnButton;
