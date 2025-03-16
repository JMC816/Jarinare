import useModalStore from '@/shared/modals/Auth/Login/model/store';
import LoginButton from '@/shared/ui/LoginButton';
import { OtherLoginArray } from '@/widgets/Auth/Login/consts/OtherLogin';

const LoginList = () => {
  const { openModal } = useModalStore();
  return (
    <>
      <LoginButton
        text="회원번호로 로그인"
        bgColor="blue"
        textColor="white"
        modalTypes={'UserNumberModal'}
      />
      <div className="flex flex-col">
        <div className="mt-5 flex flex-col items-center gap-y-5">
          {OtherLoginArray.map(({ text, modal }, idx) => (
            <span
              onClick={() => openModal(modal)}
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
