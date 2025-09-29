import { trainQueryData } from '@/features/TicketReserve/hooks/trainQueryData';
import { errorStateStore } from '@/features/TicketReserve/model/errorStateStore';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import { ReserveButtonProps } from '@/shared/types/ButtonType';
import useReserveModalStore from '@/widgets/model/ReserveStore';
import { useNavigate } from 'react-router-dom';

const ReserveButton = ({
  text,
  textColor,
  bgColor,
  disabled,
}: ReserveButtonProps) => {
  const { refetch, stations } = trainQueryData();
  const { startStation, endStation, startDay } = trainDataStore();
  const { error } = errorStateStore();
  const { openModal } = useReserveModalStore();
  const navigate = useNavigate();

  const onClick = () => {
    const reserveCondition =
      startStation && endStation && startDay && startStation !== endStation;
    const errorCondition = stations.length === 0 && error === 'Network Error';

    // 조회 조건 충족 + 에러가 없는
    if (reserveCondition && !errorCondition) {
      refetch();
      navigate('/reserve/trainCheck');
      return;
    }
    // 조회 조건 충족 + 에러가 있는
    if (reserveCondition && errorCondition) {
      openModal('ErrorModal');
      return;
    }
  };

  return (
    <button
      disabled={disabled}
      type="button"
      onClick={onClick}
      className={`relative flex h-12 w-[300px] items-center justify-center rounded-sm text-base font-bold active:brightness-50 disabled:bg-lightBlueImpossible text-${textColor} bg-${bgColor}`}
    >
      {text}
    </button>
  );
};

export default ReserveButton;
