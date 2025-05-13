import { trainQueryData } from '@/features/TicketReserve/hooks/trainQueryData';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import { ReserveButtonProps } from '@/shared/types/ButtonType';

const ReserveButton = ({ text, textColor, bgColor }: ReserveButtonProps) => {
  const { refetch } = trainQueryData();
  const { startStation, endStation, startDay } = trainDataStore();
  return (
    <button
      type="button"
      onClick={() => {
        if (startStation && endStation && startDay) {
          refetch();
        }
      }}
      className={`relative flex h-12 w-[300px] items-center justify-center rounded-sm text-base font-bold active:brightness-50 disabled:bg-lightBlueImpossible text-${textColor} bg-${bgColor}`}
    >
      {text}
    </button>
  );
};

export default ReserveButton;
