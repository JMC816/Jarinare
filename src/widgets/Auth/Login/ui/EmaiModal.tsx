import EmailForm from '@/features/Auth/Login/ui/EmailForm';
import NextButton from './NextButton';
import BackWardModalButton from '@/widgets/layouts/ui/BackWardModalButton';
import useModalStore from '@/widgets/model/AuthStore';
import LoginStageLine from './LoginStageLine';

const EmailModal = () => {
  const { closeModal } = useModalStore();
  return (
    <div className="flex h-full w-full flex-col items-center bg-lightestGray pl-[38px] pr-[37px]">
      <BackWardModalButton closeModal={() => closeModal('EmailModal')} />
      <EmailForm />
      <LoginStageLine stage={1} width={150} borderRadius="xl" />
      <NextButton
        text="다음"
        bgColor="blue"
        textColor="white"
        modalTypes={'PasswordModal'}
      />
    </div>
  );
};

export default EmailModal;
