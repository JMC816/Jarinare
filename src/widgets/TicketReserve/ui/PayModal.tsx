import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import useModalStore from '../../model/ReserveStore';
import { useSeatQueryData } from '@/features/TicketReserve/hooks/useSeatQueryData';
import { useState } from 'react';
import { useGetPoint } from '@/features/Point/hooks/useGetPoint';
import { useUpdatePoint } from '@/features/Point/hooks/useUpdatePoint';
import PaymentButton from './PaymentButton';
import { seatsStateCountStore } from '@/features/TicketReserve/model/seatsStateCountStore';
import { useSaveReserveStat } from '@/features/TicketReserve/hooks/useSaveReserveStat';

const PayModal = () => {
  const { closeModal } = useModalStore();
  const { selectPay, endStationForView } = trainDataStore();
  const { createSelectedSeats } = useSeatQueryData();
  const { saveStat } = useSaveReserveStat();
  const [checked, setChekced] = useState<boolean>(false);
  const [value, setValue] = useState<number | null>(null);
  const { point } = useGetPoint();
  const { updatePoint } = useUpdatePoint();
  const { seatsStateCount } = seatsStateCountStore();

  const onChange = () => {
    setChekced((prev) => !prev);
  };

  const onClick = () => {
    setValue(point);
  };

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-end bg-black/40"
      onClick={() => closeModal('PayModal')}
    >
      <div
        className="mb-4 w-[343px] animate-slide-up rounded-3xl bg-white px-6 pb-8 pt-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 핸들 바 */}
        <div className="mb-5 flex justify-center">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>
        <p className="mb-1 text-base font-bold text-gray-800">결제 하실 금액</p>
        <p className="mb-4 text-xl font-bold text-gray-900">
          {(selectPay * seatsStateCount).toLocaleString('ko-KR')}원
        </p>

        {/* 포인트 사용 */}
        <div className="mb-3 flex items-center gap-2">
          <input
            autoComplete="off"
            type="checkbox"
            id="check"
            checked={checked}
            onChange={onChange}
            disabled={point === 0}
            className={`appearance-none rounded border border-blue p-2 ${checked ? "bg-blue bg-[url('@/assets/icons/point_check.png')] bg-center bg-no-repeat" : ''} ${point === 0 ? 'cursor-not-allowed opacity-50' : ''}`}
          />
          <label htmlFor="check" className="flex">
            <span className={`${checked ? 'text-darkGray' : 'text-lightGray'} text-sm`}>
              포인트 사용
            </span>
          </label>
        </div>

        <div className="mb-3">
          <div className={`flex w-full justify-between gap-1 ${checked ? 'text-black' : 'text-lightGray'} h-8`}>
            <input
              type="text"
              disabled={!checked}
              className="flex-1 rounded-xl border border-lightGray px-2 text-end text-sm"
              value={
                !checked
                  ? ''
                  : value === null || value === 0
                    ? ''
                    : value.toLocaleString('ko-KR')
              }
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const inputValue = e.target.value.replace(/,/g, '');
                const numValue = inputValue === '' ? 0 : Number(inputValue);
                if (
                  selectPay * seatsStateCount &&
                  (inputValue === '' || (point >= numValue && numValue >= 0))
                ) {
                  setValue(numValue);
                }
              }}
            />
            <button
              onClick={onClick}
              disabled={!checked}
              className="rounded-xl border border-lightGray bg-white px-2 text-xs shadow-sm active:brightness-95 disabled:opacity-50"
            >
              모두 사용
            </button>
          </div>
          <span className="mt-1 flex w-full justify-end text-xs text-darkGray">
            보유 포인트&nbsp;
            <span className="text-blue">{point.toLocaleString('ko-KR')}</span>
            &nbsp;원
          </span>
        </div>

        {/* 금액 요약 */}
        <div className="mb-4 rounded-2xl bg-gray-50 px-4 py-3">
          <div className="flex justify-between text-sm font-bold text-gray-800">
            <span>최종 결제금액</span>
            <span>
              {checked
                ? (selectPay * seatsStateCount - Number(value)).toLocaleString('ko-KR')
                : (selectPay * seatsStateCount).toLocaleString('ko-KR')}원
            </span>
          </div>
          <div className="my-2 w-full border border-gray-200" />
          <div className="flex flex-col gap-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">총 결제금액</span>
              <span className="text-gray-700">{(selectPay * seatsStateCount).toLocaleString('ko-KR')}원</span>
            </div>
            {checked && (
              <div className="flex justify-between">
                <span className="text-gray-400">포인트 사용</span>
                <span className="text-blue">
                  {value === null ? 0 : '-' + value.toLocaleString('ko-KR')}원
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={() => closeModal('PayModal')}
            className="flex-1 rounded-2xl bg-gray-100 py-3.5 text-base font-bold text-gray-600"
          >
            취소
          </button>
          <button
            onClick={async () => {
              await createSelectedSeats(selectPay * seatsStateCount - Number(value));
              await updatePoint(point - Number(value));
              await saveStat(endStationForView);
              closeModal('PayModal');
            }}
            className="flex-[2] rounded-2xl bg-blue py-3.5 text-base font-bold text-white active:brightness-95"
          >
            결제
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayModal;
