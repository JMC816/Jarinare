import LoginButton from '@/shared/ui/LoginButton';
import { OtherLoginArray } from '@/widgets/Auth/Login/consts/OtherLogin';

const LoginList = () => {
  return (
    <>
      <LoginButton text="회원번호로 로그인" bgColor="blue" textColor="white" />
      <div className="flex flex-col">
        <div className="mt-5 flex flex-col items-center gap-y-5">
          {OtherLoginArray.map(({ text }, idx) => (
            <span
              className="text-base font-bold text-blue opacity-80"
              key={idx}
            >
              {text}
            </span>
          ))}
        </div>
      </div>
    </>
  );
};

export default LoginList;
