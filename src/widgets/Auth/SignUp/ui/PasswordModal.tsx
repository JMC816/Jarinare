import PasswordForm from '@/features/Auth/SignUp/ui/PasswordForm';
import SignUpButton from './SignUpButton';
import useModalStore from '@/widgets/model/AuthStore';
import BackWardModalButton from '@/widgets/layouts/ui/BackWardModalButton';
import SignUpStageLine from './SignUpStageLine';

const PasswordModal = () => {
  const { openModal, closeModal } = useModalStore();
  return (
    <div className="flex h-full w-full flex-col items-center bg-lightestGray pl-[38px] pr-[37px]">
      <BackWardModalButton
        closeModal={() => closeModal('PasswordModal')}
        openModal={() => openModal('NumberModal')}
      />
      <PasswordForm />
      <SignUpStageLine stage={3} width={300} borderRadius="xl" />
      <SignUpButton
        text="회원가입"
        bgColor="blue"
        textColor="white"
        modalTypes={'PasswordModal'}
      />
    </div>
  );
};

export default PasswordModal;
