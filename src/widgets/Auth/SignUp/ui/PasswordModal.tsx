import PasswordForm from '@/features/Auth/SignUp/ui/PasswordForm';
import SignUpButton from './SignUpButton';
import useModalStore from '@/widgets/model/AuthStore';
import BackWardModalButton from '@/widgets/layouts/ui/BackWardModalButton';
import SignUpStageLine from './SignUpStageLine';
import { useFormContext } from 'react-hook-form';
import { useSignUpState } from '@/features/Auth/SignUp/hooks/useSignUpState';

const PasswordModal = () => {
  const { openModal, closeModal } = useModalStore();
  const { handleSubmit } = useFormContext();
  // 유효성 검사를 통과한 값을 회원가입 로직으로 전달
  const { onSubmit } = useSignUpState();
  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        await onSubmit(data);
        closeModal('EmailModal');
        closeModal('NameModal');
        closeModal('PasswordModal');
      })}
      className="flex h-full w-full flex-col items-center bg-lightestGray pl-[38px] pr-[37px]"
    >
      <BackWardModalButton
        closeModal={() => closeModal('PasswordModal')}
        openModal={() => openModal('NameModal')}
      />
      <PasswordForm />
      <SignUpStageLine stage={3} width={300} borderRadius="xl" />
      <SignUpButton text="회원가입" bgColor="blue" textColor="white" />
    </form>
  );
};

export default PasswordModal;
