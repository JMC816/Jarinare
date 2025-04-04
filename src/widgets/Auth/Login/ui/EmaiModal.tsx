import AuthContent from '@/shared/ui/AuthContent';
import LoginButton from './LoginButton';

const EmailModal = () => {
  return (
    <div className="flex h-full w-full flex-col items-center bg-lightestGray pl-[38px] pr-[37px]">
      <AuthContent title="로그인" subtitle="이메일" placeholder="이메일" />
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

export default EmailModal;
