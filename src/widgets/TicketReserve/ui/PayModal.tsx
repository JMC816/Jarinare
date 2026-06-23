/**
 * @role: widgets/TicketReserve — ui
 * @rule: 렌더링만 담당, 비즈니스 로직 포함 금지
 */
import { usePayModal } from '../hooks/usePayModal';

const PayModal = () => {
  const {
    checked,
    value,
    eventSelected,
    setEventSelected,
    isDiscountEligible,
    basePrice,
    discountedBase,
    finalPrice,
    point,
    season,
    style,
    handleTogglePoint,
    handleUseAllPoint,
    handlePointInput,
    handleClose,
    handlePay,
  } = usePayModal();

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-end bg-black/40 lg:justify-center lg:backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="mb-4 w-[343px] animate-slide-up rounded-3xl bg-white px-6 pb-8 pt-5 lg:mb-0 lg:w-[440px] lg:animate-fade-up lg:rounded-2xl lg:px-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모바일 핸들 바 */}
        <div className="mb-5 flex justify-center lg:hidden">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        {/* PC 헤더 */}
        <div className="mb-5 hidden lg:flex lg:items-start lg:justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">결제</p>
            <p className="mt-0.5 text-xs text-gray-400">
              최종 금액을 확인하고 결제해주세요
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p className="mb-1 text-base font-bold text-gray-800 lg:hidden">
          결제 하실 금액
        </p>
        <p className="mb-4 text-xl font-bold text-gray-900">
          {basePrice.toLocaleString('ko-KR')}원
        </p>

        {/* 이벤트 드롭다운 */}
        <div className="mb-3">
          <p className="mb-1 text-xs font-bold text-gray-500">이벤트 선택</p>
          <select
            value={eventSelected}
            onChange={(e) =>
              setEventSelected(e.target.value as 'none' | 'season')
            }
            className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${
              eventSelected === 'season'
                ? `border-current ${style.color} font-bold`
                : 'border-lightGray text-gray-600'
            }`}
          >
            <option value="none">선택안함</option>
            {isDiscountEligible && (
              <option value="season">
                {style.emoji} {season} 계절 10% 할인
              </option>
            )}
          </select>
        </div>

        {/* 포인트 사용 */}
        <div className="mb-3 flex items-center gap-2">
          <input
            autoComplete="off"
            type="checkbox"
            id="check"
            checked={checked}
            onChange={handleTogglePoint}
            disabled={point === 0}
            className={`appearance-none rounded border border-blue p-2 ${checked ? "bg-blue bg-[url('@/assets/icons/point_check.png')] bg-center bg-no-repeat" : ''} ${point === 0 ? 'cursor-not-allowed opacity-50' : ''}`}
          />
          <label htmlFor="check" className="flex">
            <span
              className={`${checked ? 'text-darkGray' : 'text-lightGray'} text-sm`}
            >
              포인트 사용
            </span>
          </label>
        </div>

        <div className="mb-3">
          <div
            className={`flex w-full justify-between gap-1 ${checked ? 'text-black' : 'text-lightGray'} h-8`}
          >
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
              onChange={handlePointInput}
            />
            <button
              onClick={handleUseAllPoint}
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
            <span>{finalPrice.toLocaleString('ko-KR')}원</span>
          </div>
          <div className="my-2 w-full border border-gray-200" />
          <div className="flex flex-col gap-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">총 결제금액</span>
              <span className="text-gray-700">
                {basePrice.toLocaleString('ko-KR')}원
              </span>
            </div>
            {eventSelected === 'season' && isDiscountEligible && (
              <div className="flex justify-between">
                <span className="text-gray-400">
                  {style.emoji} {season} 계절 할인 (10%)
                </span>
                <span className="text-orange-500">
                  -{(basePrice - discountedBase).toLocaleString('ko-KR')}원
                </span>
              </div>
            )}
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
            onClick={handleClose}
            className="flex-1 rounded-2xl bg-gray-100 py-3.5 text-base font-bold text-gray-600 transition-colors hover:bg-gray-200"
          >
            취소
          </button>
          <button
            onClick={handlePay}
            className="flex-[2] rounded-2xl bg-blue py-3.5 text-base font-bold text-white transition-colors hover:bg-blue/90 active:brightness-95"
          >
            결제
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayModal;
