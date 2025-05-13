import { ButtonProps } from '../types/ButtonType';

const Button = ({
  modalTypes,
  text,
  textColor,
  bgColor,
  icon,
  onModalClick,
}: ButtonProps) => {
  return (
    <button
      type="button"
      onClick={() => {
        onModalClick!(modalTypes!);
      }}
      className={`relative flex h-12 w-[300px] items-center justify-center rounded-sm text-base font-bold active:brightness-50 disabled:bg-lightBlueImpossible text-${textColor} bg-${bgColor}`}
    >
      {icon ? (
        <img
          className="absolute left-[20px]"
          width={20}
          height={20}
          src={icon}
        />
      ) : null}
      {text}
    </button>
  );
};

export default Button;
