import LoginContant from './LoginContant';

const PasswordModal = () => {
  return (
    <div className="flex h-full w-full flex-col items-center bg-lightestGray pl-[38px] pr-[37px]">
      <LoginContant
        title="로그인"
        subtitle="비밀번호"
        placeholder="비밀번호"
        stage="2단계"
      />
    </div>
  );
};

export default PasswordModal;
