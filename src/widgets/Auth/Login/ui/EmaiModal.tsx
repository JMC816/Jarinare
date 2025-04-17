import EmailForm from '@/features/Auth/Login/ui/EmailForm';
import NextButton from './NextButton';
import BackWardModalButton from '@/widgets/layouts/ui/BackWardModalButton';
import useModalStore from '@/widgets/model/AuthStore';
import LoginStageLine from './LoginStageLine';
import { useFormContext } from 'react-hook-form';

const EmailModal = () => {
  const { closeModal } = useModalStore();
  const { formState, getValues } = useFormContext();
  return (
    <div className="flex h-full w-full flex-col items-center bg-lightestGray pl-[38px] pr-[37px]">
      <BackWardModalButton closeModal={() => closeModal('EmailModal')} />
      <EmailForm />
      <LoginStageLine stage={1} width={150} borderRadius="xl" />
      <NextButton
        text="다음"
        bgColor="blue"
        textColor="white"
        // 이메일 에러나 빈 값일 시 다음 모달 제한
        modalTypes={
          formState.errors.email || getValues('email') == ''
            ? 'EmailModal'
            : 'PasswordModal'
        }
      />
    </div>
  );
};

export default EmailModal;
