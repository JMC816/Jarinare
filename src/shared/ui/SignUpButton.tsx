import useModalStore from '../modals/Auth/SignUp/model/store';
import SignUpStageLine from '../modals/Auth/SignUp/ui/SignUpStageLine';
import { Props } from '../types/Login';

const SignUpButton = ({
  bgColor,
  textColor,
  text,
  icon,
  modalTypes,
  stage,
}: Props) => {
  const { openModal } = useModalStore();
  return (
    <div className="mb-[45px] flex flex-col gap-y-5">
      <SignUpStageLine stage={stage} />
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
    </div>
  );
};

export default SignUpButton;
