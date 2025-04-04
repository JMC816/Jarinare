import { RequestChangeButtonProps } from '../types/TicketChangeType';

const RequestChangeButton = ({
  text,
  bgColor,
  textColor,
  onClick,
}: RequestChangeButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`h-12 w-[100px] rounded-xs bg-${bgColor} text-${textColor} text-base active:brightness-50`}
    >
      {text}
    </button>
  );
};

export default RequestChangeButton;
