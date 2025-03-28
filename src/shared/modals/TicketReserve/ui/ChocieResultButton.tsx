import { ChocieResultButtonProps } from '../types/Reserve';

const ChocieResultButton = ({
  text,
  bgColor,
  textColor,
  onClick,
}: ChocieResultButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`h-12 w-[140px] rounded-sm bg-${bgColor} text-${textColor}`}
    >
      {text}
    </button>
  );
};

export default ChocieResultButton;
