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
      className={`flex h-[30px] w-[50px] items-center justify-center rounded-sm border border-lightGray ${disabled ? 'bg-lightestGray opacity-50' : 'bg-lightBlue'} ${disabled ? 'active:brightness-100' : 'active:brightness-50'} shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95`}
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
