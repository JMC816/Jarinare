import useModalStore from '@/shared/modals/model/AuthStore';
import AuthContent from '@/shared/ui/AuthContent';
import SignUpButton from '@/shared/ui/SignUpButton';
import Modal from '@/widgets/modals/Auth/SignUp/ui/Modal';

const SignUpPage = () => {
  const { isShow, modalType } = useModalStore();
  return (
    <div className="flex h-full w-full flex-col items-center bg-lightestGray pl-[38px] pr-[37px]">
      <AuthContent title="회원가입" subtitle="이메일" placeholder="이메일" />
      <SignUpButton
        stage="1단계"
        text="다음"
        bgColor="blue"
        textColor="white"
        modalTypes={'NumberModal'}
      />
      {isShow == false || modalType == undefined ? null : <Modal />}
    </div>
  );
};

export default SignUpPage;
