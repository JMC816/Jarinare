import { Props } from '../types/Login';

const LoginButton = ({ bgColor, text }: Props) => {
  return (
    <button
      className={`flex h-12 w-[300px] items-center justify-center rounded-sm border bg-${bgColor}`}
    >
      {text}
    </button>
  );
};

export default LoginButton;
