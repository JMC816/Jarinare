import useModalStore from '@/shared/modals/Auth/SignUp/model/store';
import Modal from '@/shared/modals/Auth/SignUp/ui/Modal';
import SignUpContant from '@/shared/modals/Auth/SignUp/ui/SignUpContant';
import SignUpButton from '@/shared/ui/SignUpButton';

const SignUpPage = () => {
  const { isShow, modalType } = useModalStore();
  return (
    <div className="flex h-full w-full flex-col items-center bg-lightestGray pl-[38px] pr-[37px]">
      <SignUpContant title="회원가입" subtitle="이메일" placeholder="이메일" />
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
