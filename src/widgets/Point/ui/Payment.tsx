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
    <div className="flex w-full py-5 pl-[28px] pr-[27px]">
      <div className="flex w-1/3 items-center justify-start">
        <img width={32} height={32} src={donate} />
      </div>
      <div className="flex w-full flex-col">
        <span className="text-base">포인트 지급</span>
        <span className="text-tiny text-darkGray">
          {newCreatAt()} | 자리나레
        </span>
      </div>
      <div className="flex w-1/3 flex-col items-end">
        <span className="text-base">
          {Number('2000').toLocaleString('ko-KR')} 원
        </span>
        <span className="text-tiny text-darkGray">
          {Number(accruedPoint ?? 0).toLocaleString('ko-KR')} 원
        </span>
      </div>
    </div>
  );
};
