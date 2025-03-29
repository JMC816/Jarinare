import LoginStageLine from '../modals/Auth/Login/ui/LoginStageLine';
import useModalStore from '../modals/model/store';
import { ButtonProps } from '../types/Button';

const LoginButton = ({
  bgColor,
  textColor,
  text,
  modalTypes,
  stage,
}: ButtonProps) => {
  const { openModal } = useModalStore();
  return (
    <div className="mb-[45px] flex flex-col gap-y-5">
      <LoginStageLine stage={stage!} />
      <button
        onClick={() => openModal(modalTypes!)}
        className={`relative flex h-12 w-[300px] items-center justify-center rounded-sm text-base font-bold active:brightness-50 text-${textColor} bg-${bgColor}`}
      >
        {text}
      </button>
    </div>
  );
};

export default LoginButton;
