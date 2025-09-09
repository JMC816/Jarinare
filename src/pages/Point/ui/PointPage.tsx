import { useGetPayment } from '@/features/Point/hooks/useGetPayment';
import BackWardPageButton from '@/widgets/layouts/ui/BackWardPageButton';
import { Payment } from '@/widgets/Point/ui/Payment';

const PontPage = () => {
  const { payment } = useGetPayment();

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full flex-col items-center pl-[28px] pr-[27px]">
        <BackWardPageButton />
        <span className="mt-5 w-full text-lg font-bold">포인트 내역</span>
      </div>
      <div className="mt-[30px] h-5 w-full bg-lightestGray" />
      {payment.map((item) => (
        <Payment
          key={item.createAt}
          accruedPoint={item.accruedPoint}
          createAt={item.createAt}
        />
      ))}
    </div>
  );
};

export default PontPage;
