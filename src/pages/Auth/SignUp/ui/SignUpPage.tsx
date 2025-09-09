import { SignUp } from '@/features/Auth/SignUp/model/SignUpSchema';
import EmailForm from '@/features/Auth/SignUp/ui/EmailForm';
import Modal from '@/widgets/Auth/SignUp/ui/Modal';
import NextButton from '@/widgets/Auth/SignUp/ui/NextButton';
import SignUpStageLine from '@/widgets/Auth/SignUp/ui/SignUpStageLine';
import BackWardPageButton from '@/widgets/layouts/ui/BackWardPageButton';
import useModalStore from '@/widgets/model/AuthStore';
import { FormProvider } from 'react-hook-form';

const SignUpPage = () => {
  const { isShow, modalType } = useModalStore();
  const { method } = SignUp();
  return (
    <FormProvider {...method}>
      <div className="flex h-full w-full flex-col items-center bg-lightestGray pl-[38px] pr-[37px]">
        <BackWardPageButton />
        <EmailForm />
        <SignUpStageLine stage={1} width={100} borderRadius="xl" />
        <NextButton
          text="다음"
          bgColor="blue"
          textColor="white"
          modalTypes={
            // 이메일 에러나 빈 값일 시 다음 모달 제한
            method.formState.errors.email || method.getValues('email') == ''
              ? null
              : 'NameModal'
          }
        />
        {isShow == false || modalType == undefined ? null : <Modal />}
      </div>
    </FormProvider>
  );
};

export default SignUpPage;
