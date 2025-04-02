import { SeatChangeButtonProps } from '../types/TicketChangeType';

const SeatChangeButton = ({
  text,
  bgColor,
  textColor,
  onClick,
}: SeatChangeButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`flex h-12 w-[150px] items-center justify-center rounded-xs text-base font-bold active:brightness-50 bg-${bgColor} text-${textColor}`}
    >
      {text}
    </button>
  );
};

export default SeatChangeButton;
