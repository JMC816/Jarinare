import { AuthPlaceholer } from '../types/Auth';

const AuthInput = ({ placeholder }: AuthPlaceholer) => {
  return (
    <input
      placeholder={placeholder}
      className="h-12 w-[300px] items-center justify-center rounded-sm bg-white px-[15px] text-tiny font-bold text-lightGray"
    />
  );
};

export default AuthInput;
