import { AuthInputProps } from '../types/AuthType';

const AuthInput = ({ placeholder, name }: AuthInputProps) => {
  return (
    <>
      <input
        {...name}
        onKeyDown={(e) => {
          if (e.key == 'Enter') {
            e.preventDefault();
          }
        }}
        placeholder={placeholder}
        className="h-12 w-[300px] items-center justify-center rounded-sm bg-white px-[15px] text-tiny font-bold text-lightGray"
      />
    </>
  );
};

export default AuthInput;
