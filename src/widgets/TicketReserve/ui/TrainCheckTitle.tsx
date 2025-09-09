import black_prev from '@/assets/icons/black_prev.png';
import black_next from '@/assets/icons/black_next.png';
import { useDayHandle } from '../hooks/ReserveHook';
import { formatDateForView } from '@/shared/lib/formatDate';

const TrainCheckTitle = () => {
  const { day, handleYesterday, handleTomorrow } = useDayHandle();
  return (
    <div className="mt-[30px] flex w-full justify-between">
      <div
        onClick={handleYesterday}
        className="flex h-[25px] w-[25px] cursor-pointer items-center justify-center rounded-xs bg-lightGray active:brightness-50"
      >
        <img src={black_prev} width={7} height={11} />
      </div>
      <span className="flex items-center text-base font-bold text-blue">
        {formatDateForView(day)}
      </span>
      <div
        onClick={handleTomorrow}
        className="flex h-[25px] w-[25px] cursor-pointer items-center justify-center rounded-xs bg-lightGray active:brightness-50"
      >
        <img src={black_next} width={7} height={11} />
      </div>
    </div>
  );
};
export default TrainCheckTitle;
