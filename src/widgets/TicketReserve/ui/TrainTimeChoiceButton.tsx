import { MiniButtonProp } from '@/shared/types/ButtonType';

const TrainTimeChocieButton = ({
  text,
  modalTypes,
  onModalClick,
  disabled,
}: MiniButtonProp) => {
  return (
    <button
      disabled={disabled}
      onClick={() => {
        onModalClick(modalTypes!);
      }}
      className={`flex h-[30px] w-[50px] items-center justify-center rounded-sm ${disabled ? 'bg-lightestGray' : 'bg-lightBlue'} ${disabled ? 'active:brightness-100' : 'active:brightness-50'} `}
    >
      <span
        className={`text-sm font-bold ${disabled ? 'text-lightBlueImpossible' : 'text-blue'} `}
      >
        {text}
      </span>
    </button>
  );
};

export default TrainTimeChocieButton;
