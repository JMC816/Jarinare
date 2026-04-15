import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import useModalStore from '../../model/ReserveStore';
import { useNavigation } from '../hooks/ReserveHook';
import { formatTimeView } from '@/shared/lib/formatDate';

const ChoiceResultModal = () => {
  const { closeModal } = useModalStore();
  const { navigate } = useNavigation();
  // 선택한 기차 시간의 정보
  const {
    selectStartTime,
    selectEndTime,
    selectTrainType,
    selectKid,
    selectAdult,
    selectPay,
  } = trainDataStore();

  const depH = Number(String(selectStartTime).substring(8, 10));
  const depM = Number(String(selectStartTime).substring(10, 12));
  const arrH = Number(String(selectEndTime).substring(8, 10));
  const arrM = Number(String(selectEndTime).substring(10, 12));
  let durationMin = (arrH * 60 + arrM) - (depH * 60 + depM);
  if (durationMin < 0) durationMin += 24 * 60;
  const durationText = durationMin >= 60
    ? `${Math.floor(durationMin / 60)}시간 ${durationMin % 60 > 0 ? `${durationMin % 60}분` : ''}`
    : `${durationMin}분`;

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-end bg-black/40"
      onClick={() => closeModal('ChoiceResultModal')}
    >
      <div
        className="mb-4 w-[343px] animate-slide-up rounded-3xl bg-white px-6 pb-8 pt-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 핸들 바 */}
        <div className="mb-5 flex justify-center">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        <p className="mb-4 text-base font-bold text-gray-800">선택 확인</p>

        {/* 시간 */}
        <div className="mb-4 rounded-2xl bg-gray-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400">시간</span>
            <span className="text-[10px] text-gray-400">소요시간</span>
          </div>
          <div className="mt-0.5 flex items-center justify-between">
            <p className="text-base font-bold text-gray-900">
              {formatTimeView(String(selectStartTime))}
              <span className="mx-2 font-normal text-gray-400">→</span>
              {formatTimeView(String(selectEndTime))}
            </p>
            <span className="text-xs font-semibold text-gray-800">{durationText}</span>
          </div>
        </div>

        {/* 열차 / 인원 / 요금 */}
        <div className="flex flex-col gap-y-2">

          <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
            <span className="text-[10px] text-gray-400">열차</span>
            <span className="text-xs font-bold text-gray-800">{selectTrainType}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
            <span className="text-[10px] text-gray-400">인원</span>
            <span className="text-xs font-semibold text-gray-800">
              어른 <span className="text-blue">{selectAdult}</span>명 • 어린이{' '}
              <span className="text-blue">{selectKid}</span>명
            </span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
            <span className="text-[10px] text-gray-400">요금</span>
            <span className="text-xs font-bold text-gray-800">
              {selectPay.toLocaleString('ko-KR')}원
            </span>
          </div>
        </div>

        {/* 버튼 */}
        <div className="mt-5 flex gap-3">
          <button
            onClick={() => closeModal('ChoiceResultModal')}
            className="flex-1 rounded-2xl bg-gray-100 py-3.5 text-base font-bold text-gray-600"
          >
            취소
          </button>
          <button
            onClick={() => {
              closeModal('ChoiceResultModal');
              navigate('/reserve/seatcheck');
            }}
            className="flex-2 flex-[2] rounded-2xl bg-blue py-3.5 text-base font-bold text-white"
          >
            좌석 조회
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChoiceResultModal;
