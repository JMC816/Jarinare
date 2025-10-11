import BackWardModalButton from '@/widgets/layouts/ui/BackWardModalButton';
import LoginButton from './LoginButton';
import PasswordForm from '@/features/Auth/Login/ui/PasswordForm';
import useModalStore from '@/widgets/model/AuthStore';
import LoginStageLine from './LoginStageLine';
import { useFormContext } from 'react-hook-form';
import { useLoginState } from '@/features/Auth/Login/hooks/useLoginState';

const PasswordModal = () => {
  const { openModal, closeModal } = useModalStore();
  const { handleSubmit } = useFormContext();
  // 유효성 검사를 통과한 값을 로그인 로직으로 전달
  const { onSubmit } = useLoginState();
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex h-full w-full flex-col items-center bg-lightestGray pl-[38px] pr-[37px]"
    >
      <BackWardModalButton
        openModal={() => openModal('EmailModal')}
        closeModal={() => closeModal('PasswordModal')}
      />
      <PasswordForm />
      <LoginStageLine stage={2} width={300} borderRadius="xl" />
      <LoginButton text="로그인" bgColor="blue" textColor="white" />
    </form>
  );
};

export default PasswordModal;
