import PasswordForm from '@/features/Auth/SignUp/ui/PasswordForm';
import SignUpButton from './SignUpButton';
import useModalStore from '@/widgets/model/AuthStore';
import BackWardModalButton from '@/widgets/layouts/ui/BackWardModalButton';
import SignUpStageLine from './SignUpStageLine';
import { useFormContext } from 'react-hook-form';
import { useSignUpState } from '@/features/Auth/SignUp/hooks/useSignUpState';

const PasswordModal = () => {
  const { openModal, closeModal } = useModalStore();
  const {
    formState: { errors },
    getValues,
  } = useFormContext();
  // 유효성 검사를 통과한 값을 회원가입 로직으로 전달
  const { onSubmit } = useSignUpState(getValues);
  return (
    <form
      onSubmit={onSubmit}
      className="flex h-full w-full flex-col items-center bg-lightestGray pl-[38px] pr-[37px]"
    >
      <BackWardModalButton
        closeModal={() => closeModal('PasswordModal')}
        openModal={() => openModal('NameModal')}
      />
      <PasswordForm />
      <SignUpStageLine stage={3} width={300} borderRadius="xl" />
      <SignUpButton
        text="회원가입"
        bgColor="blue"
        textColor="white"
        modalTypes={
          // 비밀번호 에러나 빈 값일 시 회원가입 제한
          errors.password || getValues('password') == ''
            ? 'PasswordModal'
            : 'PasswordModal'
        }
      />
    </form>
  );
};

export default PasswordModal;
