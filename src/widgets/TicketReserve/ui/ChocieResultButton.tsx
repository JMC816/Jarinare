import { ChocieResultButtonProps } from '../types/ReserveType';

const ChocieResultButton = ({
  text,
  bgColor,
  textColor,
  onClick,
}: ChocieResultButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`h-12 w-[140px] rounded-sm active:brightness-50 bg-${bgColor} text-${textColor}`}
    >
      {text}
    </button>
  );
};

export default ChocieResultButton;
