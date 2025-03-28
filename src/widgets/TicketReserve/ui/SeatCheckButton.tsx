import { SeatCheckButtonProps } from '../types/ReserveTitle';

const SeatCheckButton = ({
  text,
  bgColor,
  textColor,
  onClick,
}: SeatCheckButtonProps) => {
  return (
    <div
      onClick={onClick}
      className={`flex h-12 w-[150px] items-center justify-center rounded-xs text-base font-bold bg-${bgColor} text-${textColor}`}
    >
      {text}
    </div>
  );
};

export default SeatCheckButton;
