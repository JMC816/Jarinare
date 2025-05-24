import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import useModalStore from '../../model/ReserveStore';
import { formatAM_PM, formatTimeView } from '../lib/formatDate';
import ChocieResultButton from './ChocieResultButton';
import ChoiceResultList from './ChoiceResultList';
import { useNavigation } from '../hooks/ReserveHook';

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

  return (
    <div className="flex flex-col items-center justify-end w-full h-full bg-darkGray/50">
      <div className="mb-[15px] flex h-[350px] w-[345px] flex-col items-center rounded-2xl bg-white pl-[23px] pr-[22px]">
        <span className="mt-[40px] text-lg font-bold text-blue">
          {formatAM_PM(String(selectStartTime)) < 12 ? '오전' : '오후'}{' '}
          {/* 출발 시간 */}
          {formatTimeView(String(selectStartTime))} -{' '}
          {formatAM_PM(String(selectEndTime)) < 12 ? '오전' : '오후'}{' '}
          {/* 도착 시간 */}
          {formatTimeView(String(selectEndTime))}{' '}
        </span>
        <div className="mt-[35px] w-full text-base font-bold">
          <ChoiceResultList title="열차" text={selectTrainType} />
          <div className="mb-[25px] mt-[25px] w-full border border-lightGray" />
          <ChoiceResultList
            title="인원"
            text={
              <>
                어른 <span className="text-blue">{selectAdult}</span>명 • 어린이{' '}
                <span className="text-blue">{selectKid}</span>명
              </>
            }
          />
          <div className="mb-[25px] mt-[25px] w-full border border-lightGray" />
          <ChoiceResultList title="요금" text={selectPay + '원'} />
        </div>
        <div className="mt-[20px] flex w-full justify-between text-base font-bold">
          <ChocieResultButton
            onClick={() => closeModal('ChoiceResultModal')}
            text="취소"
            bgColor="lightBlue"
            textColor="blue"
          />
          <ChocieResultButton
            onClick={() => {
              closeModal('ChoiceResultModal');
              navigate('/reserve/seatcheck');
            }}
            text="좌석 조회"
            bgColor="blue"
            textColor="white"
          />
        </div>
      </div>
    </div>
  );
};

export default ChoiceResultModal;
