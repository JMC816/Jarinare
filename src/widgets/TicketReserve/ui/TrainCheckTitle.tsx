import black_prev from '@/assets/icons/black_prev.png';
import black_next from '@/assets/icons/black_next.png';

const TrainCheckTitle = () => {
  return (
    <div className="flex w-full justify-between">
      <div className="flex h-[25px] w-[25px] cursor-pointer items-center justify-center rounded-xs bg-lightGray active:brightness-50">
        <img src={black_prev} width={7} height={11} />
      </div>
      <span className="flex items-center text-base font-bold text-blue">
        2025년 02월 28일
      </span>
      <div className="flex h-[25px] w-[25px] cursor-pointer items-center justify-center rounded-xs bg-lightGray active:brightness-50">
        <img src={black_next} width={7} height={11} />
      </div>
    </div>
  );
};
export default TrainCheckTitle;
