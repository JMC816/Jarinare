import useModalStore from '../modals/Auth/Login/model/store';
import { Props } from '../types/Login';

const LoginButton = ({ bgColor, textColor, text, icon, modalTypes }: Props) => {
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

export default LoginButton;
