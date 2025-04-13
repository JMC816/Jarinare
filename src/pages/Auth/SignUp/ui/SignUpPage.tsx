import { useSignUpState } from '@/features/Auth/SignUp/hooks/useSignUpState';
import EmailForm from '@/features/Auth/SignUp/ui/EmailForm';
import Modal from '@/widgets/Auth/SignUp/ui/Modal';
import NextButton from '@/widgets/Auth/SignUp/ui/NextButton';
import SignUpStageLine from '@/widgets/Auth/SignUp/ui/SignUpStageLine';
import { useBackButton } from '@/widgets/layouts/hooks/BackWardHook';
import BackWardPageButton from '@/widgets/layouts/ui/BackWardPageButton';
import useModalStore from '@/widgets/model/AuthStore';

const SignUpPage = () => {
  const { isShow, modalType } = useModalStore();
  const { onSubmit } = useSignUpState();
  const { onClick } = useBackButton();
  return (
    <form
      onSubmit={onSubmit}
      className="flex h-full w-full flex-col items-center bg-lightestGray pl-[38px] pr-[37px]"
    >
      <BackWardPageButton backPage={onClick} />
      <EmailForm />
      <SignUpStageLine stage={1} width={100} borderRadius="xl" />
      <NextButton
        text="다음"
        bgColor="blue"
        textColor="white"
        modalTypes={'NumberModal'}
      />
      {isShow == false || modalType == undefined ? null : <Modal />}
    </form>
  );
};

export default SignUpPage;
