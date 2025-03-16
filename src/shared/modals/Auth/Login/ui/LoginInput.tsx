import { LoginPlaceholer } from '../types/Login';

const LoginInput = ({ placeholder }: LoginPlaceholer) => {
  return (
    <input
      placeholder={placeholder}
      className="h-12 w-[300px] items-center justify-center rounded-sm bg-white px-[15px] text-tiny font-bold text-lightGray"
    />
  );
};

export default LoginInput;
