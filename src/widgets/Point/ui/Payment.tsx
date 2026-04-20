import donate from '@/assets/icons/donate.png';
import { PaymentType } from '@/entities/Point/types/paymentType';

export const Payment = ({ accruedPoint, createAt }: PaymentType) => {
  const newCreatAt = () => {
    const date = new Date(createAt * 1000);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return month + '월 ' + day + '일';
  };

  return (
    <div className="mx-4 my-2 flex items-center justify-between rounded-2xl bg-white px-4 py-4 shadow-sm">
      <div className="flex items-center gap-x-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue/10">
          <img width={20} height={20} src={donate} />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-800">포인트 지급</span>
          <span className="text-xs text-gray-400">
            {newCreatAt()} | 자리나레
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-sm font-bold text-blue">
          +{Number(accruedPoint ?? 0).toLocaleString('ko-KR')} 원
        </span>
      </div>
    </div>
  );
};
