import { MiniButtonProp } from '@/shared/types/ButtonType';

const TrainTimeChocieButton = ({
  text,
  modalTypes,
  onModalClick,
}: MiniButtonProp) => {
  return (
    <button
      onClick={() => {
        onModalClick(modalTypes!);
      }}
      className="flex h-[30px] w-[50px] items-center justify-center rounded-sm bg-lightBlue active:brightness-50"
    >
      <span className="text-sm font-bold text-blue">{text}</span>
    </button>
  );
};

export default TrainTimeChocieButton;
