import { LoadingStore } from '@/features/Auth/Login/model/useLoginStore';
import { ButtonProps } from '@/shared/types/ButtonType';

const LoginButton = ({ bgColor, textColor, text }: ButtonProps) => {
  const { isLoading } = LoadingStore();
  return (
    <div className="mb-[45px] flex flex-col gap-y-5">
      <button
        disabled={isLoading}
        type="submit"
        className={`relative flex h-12 w-[300px] items-center justify-center rounded-sm text-base font-bold active:brightness-50 disabled:bg-blue/30 text-${textColor} bg-${bgColor}`}
      >
        {text}
      </button>
    </div>
  );
};

export default LoginButton;
