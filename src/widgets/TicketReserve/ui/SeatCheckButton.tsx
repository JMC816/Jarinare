import { SeatCheckButtonProps } from '../types/ReserveType';

const SeatCheckButton = ({
  text,
  bgColor,
  textColor,
  onClick,
}: SeatCheckButtonProps) => {
  return (
    <button
      onClick={onClick!}
      className={`flex h-12 w-[150px] items-center justify-center rounded-xs text-base font-bold active:brightness-50 bg-${bgColor} text-${textColor}`}
    >
      {text}
    </button>
  );
};

export default SeatCheckButton;
