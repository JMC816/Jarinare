import useModalStore from '../../model/ReserveStore';
import { navigate } from '../hooks/ReserveHook';
import ChocieResultButton from './ChocieResultButton';
import ChoiceResultList from './ChoiceResultList';

const ChoiceResultModal = () => {
  const { closeModal } = useModalStore();
  const { moveSeatCheckPage } = navigate();
  return (
    <div className="flex h-full w-full flex-col items-center justify-end bg-darkGray/50">
      <div className="mb-[15px] flex h-[350px] w-[345px] flex-col items-center rounded-2xl bg-white pl-[23px] pr-[22px]">
        <span className="mt-[40px] text-lg font-bold text-blue">
          오전 5:03 - 오전 6:02
        </span>
        <div className="mt-[35px] w-full text-base font-bold">
          <ChoiceResultList title="열차" text="KTX-산천 201" />
          <div className="mb-[25px] mt-[25px] w-full border border-lightGray" />
          <ChoiceResultList
            title="인원"
            text={
              <>
                어른 <span className="text-blue">1</span>명 • 어린이{' '}
                <span className="text-blue">1</span>명
              </>
            }
          />
          <div className="mb-[25px] mt-[25px] w-full border border-lightGray" />
          <ChoiceResultList title="요금" text="23,400원" />
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
              moveSeatCheckPage('/reserve/seatcheck');
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
