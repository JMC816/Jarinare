import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import useModalStore from '../../model/ReserveStore';
import { useSeatQueryData } from '@/features/TicketReserve/hooks/useSeatQueryData';
import { useState } from 'react';
import { useGetPoint } from '@/features/Point/hooks/useGetPoint';
import { useUpdatePoint } from '@/features/Point/hooks/useUpdatePoint';
import PaymentButton from './PaymentButton';

const PayModal = () => {
  const { closeModal } = useModalStore();
  const { selectPay } = trainDataStore();
  const { createSelectedSeats } = useSeatQueryData();
  const [checked, setChekced] = useState<boolean>(false);
  const [value, setValue] = useState<number | null>(null);
  const { point } = useGetPoint();
  const { updatePoint } = useUpdatePoint();

  const onChange = () => {
    setChekced((prev) => !prev);
  };

  const onClick = () => {
    setValue(point);
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-darkGray/50">
      <div className="mb-[15px] flex h-[480px] w-[345px] flex-col items-center rounded-2xl bg-white pl-[40px] pr-[40px]">
        <span className="w-full pt-[25px] text-base font-bold">
          결제 하실 금액
        </span>
        <div className="flex w-full flex-col">
          <span className="text-2xl font-bold">
            {selectPay.toLocaleString('ko-KR')} 원
          </span>
          <div className="mt-[40px] flex items-center gap-2">
            <input
              type="checkbox"
              id="check"
              checked={checked}
              onChange={onChange}
              className={`appearance-none rounded border border-blue p-2 ${checked ? "bg-blue bg-[url('@/assets/icons/point_check.png')] bg-center bg-no-repeat" : null} `}
            />
            <label htmlFor="check" className="flex">
              <span
                className={`${checked ? 'text-darkGray' : 'text-lightGray'} text-base`}
              >
                포인트 사용
              </span>
            </label>
          </div>
          <div className="mt-[10px]">
            <div
              className={`flex w-full justify-between gap-1 ${checked ? 'text-black' : 'text-lightGray'} h-9`}
            >
              <input
                type="number"
                disabled={!checked}
                className={`rounded-xs border border-lightGray px-1 text-end [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                value={!checked ? '' : Number(value)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (selectPay && point >= Number(e.target.value)) {
                    setValue(
                      e.target.value === '' ? 0 : Number(e.target.value),
                    );
                  }
                }}
              />
              <button
                onClick={onClick}
                disabled={!checked}
                className="rounded-xs border border-lightGray bg-white px-2 text-base active:brightness-50"
              >
                모두 사용
              </button>
            </div>
            {checked ? (
              <span className="flex h-[20px] w-full justify-end text-base text-darkGray">
                보유 포인트&nbsp;
                <span className="text-blue">
                  {point.toLocaleString('ko-kr')}
                </span>
                &nbsp;원
              </span>
            ) : null}
          </div>
          <div className={`${checked ? 'mt-[40px]' : 'mt-[60px]'}`}>
            <div className="flex justify-between text-lg font-bold">
              <span>최종 결제금액</span>
              <span>
                {checked
                  ? (selectPay - Number(value)).toLocaleString('ko-KR')
                  : selectPay.toLocaleString('ko-KR')}{' '}
                원
              </span>
            </div>
            <div className="mt-[10px] w-full border border-lightGray" />
            <div className="mt-[15px] flex flex-col rounded-md bg-lightestGray p-3 text-base">
              <div className="flex justify-between">
                <span className="h-[20px] text-darkGray">총 결제금액</span>
                <span>{selectPay} 원</span>
              </div>
              {checked ? (
                <div className="flex h-[20px] justify-between">
                  <span className="text-darkGray">포인트 사용</span>
                  <span className="text-blue">
                    {value === null ? 0 : '-' + value.toLocaleString('ko-KR')}{' '}
                    원
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div
          className={`${checked ? 'mt-[40px]' : 'mt-[60px]'} flex w-full items-center gap-5 text-tiny`}
        >
          <PaymentButton
            onClick={() => closeModal('PayModal')}
            bgColor="lightBlue"
            text="취소"
            textColor="blue"
          />
          <PaymentButton
            onClick={async () => {
              await createSelectedSeats(selectPay - Number(value));
              await updatePoint(point - Number(value));

              closeModal('PayModal');
            }}
            bgColor="blue"
            text="결제"
            textColor="white"
          />
        </div>
      </div>
    </div>
  );
};

export default PayModal;
