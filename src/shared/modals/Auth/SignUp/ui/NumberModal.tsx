import SignUpButton from '@/shared/ui/SignUpButton';
import AuthContent from '@/shared/ui/AuthContent';

const NumberModal = () => {
  return (
    <div className="flex h-full w-full flex-col items-center bg-lightestGray pl-[38px] pr-[37px]">
      <AuthContent
        title="회원가입"
        subtitle="휴대폰 번호"
        placeholder="휴대폰 번호"
      />
      <SignUpButton
        stage="2단계"
        text="다음"
        bgColor="blue"
        textColor="white"
        modalTypes={'PasswordModal'}
      />
    </div>
  );
};

export default NumberModal;
