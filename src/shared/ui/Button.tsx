import useModalStore from '../modals/model/store';
import { Props } from '../types/Auth';

const Button = ({ modalTypes, text, textColor, bgColor, icon }: Props) => {
  const { openModal } = useModalStore();
  return (
    <button
      onClick={() => openModal(modalTypes!)}
      className={`relative flex h-12 w-[300px] items-center justify-center rounded-sm text-base font-bold text-${textColor} bg-${bgColor}`}
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
