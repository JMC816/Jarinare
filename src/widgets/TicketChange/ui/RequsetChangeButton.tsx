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
      className={`h-12 w-[100px] rounded-xs bg-${bgColor} text-${textColor} border border-lightGray text-base shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95`}
    >
      {text}
    </button>
  );
};

export default RequestChangeButton;
