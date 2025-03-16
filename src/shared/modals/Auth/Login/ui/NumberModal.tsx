import LoginContant from './LoginContant';

const NumberModal = () => {
  return (
    <div className="flex h-full w-full flex-col items-center bg-lightestGray pl-[38px] pr-[37px]">
      <LoginContant
        title="로그인"
        subtitle="휴대폰 번호"
        placeholder="휴대폰 번호"
        stage="1단계"
      />
    </div>
  );
};

export default NumberModal;
