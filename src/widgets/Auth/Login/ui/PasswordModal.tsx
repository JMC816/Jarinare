import BackWardModalButton from '@/widgets/layouts/ui/BackWardModalButton';
import LoginButton from './LoginButton';
import PasswordForm from '@/features/Auth/Login/ui/PasswordForm';
import useModalStore from '@/widgets/model/AuthStore';
import LoginStageLine from './LoginStageLine';

const PasswordModal = () => {
  const { openModal, closeModal } = useModalStore();
  return (
    <div className="flex h-full w-full flex-col items-center bg-lightestGray pl-[38px] pr-[37px]">
      <BackWardModalButton
        openModal={() => openModal('EmailModal')}
        closeModal={() => closeModal('PasswordModal')}
      />
      <PasswordForm />
      <LoginStageLine stage={2} width={300} borderRadius="xl" />
      <LoginButton
        text="로그인"
        bgColor="blue"
        textColor="white"
        modalTypes={'PasswordModal'}
      />
    </div>
  );
};

export default PasswordModal;
