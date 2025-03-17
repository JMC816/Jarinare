import LoginButton from '@/shared/ui/LoginButton';
import LoginContant from './LoginContant';

const UserNumberModal = () => {
  return (
    <div className="flex h-full w-full flex-col items-center bg-lightestGray pl-[38px] pr-[37px]">
      <LoginContant
        title="로그인"
        subtitle="회원번호"
        placeholder="회원번호"
        stage="1단계"
      />
      <LoginButton
        stage="1단계"
        text="다음"
        bgColor="blue"
        textColor="white"
        modalTypes={'PasswordModal'}
      />
    </div>
  );
};

export default UserNumberModal;
