import { LoginContants } from '../types/Login';
import SignUpInput from './SignUpInput';

const SignUpContant = ({ title, subtitle, placeholder }: LoginContants) => {
  return (
    <div className="mb-[45px] flex h-full w-full flex-col justify-between">
      <div className="mt-[55px]">
        <span className="text-lg font-bold">{title}</span>
        <div className="mt-[40px]">
          <span className="text-tiny font-bold">{subtitle}</span>
          <SignUpInput placeholder={placeholder} />
        </div>
      </div>
    </div>
  );
};

export default SignUpContant;
