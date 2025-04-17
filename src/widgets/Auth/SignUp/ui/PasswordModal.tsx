import PasswordForm from '@/features/Auth/SignUp/ui/PasswordForm';
import SignUpButton from './SignUpButton';
import useModalStore from '@/widgets/model/AuthStore';
import BackWardModalButton from '@/widgets/layouts/ui/BackWardModalButton';
import SignUpStageLine from './SignUpStageLine';
import { useFormContext } from 'react-hook-form';

const PasswordModal = () => {
  const { openModal, closeModal } = useModalStore();
  const {
    formState: { errors },
    getValues,
  } = useFormContext();
  return (
    <div className="flex h-full w-full flex-col items-center bg-lightestGray pl-[38px] pr-[37px]">
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
    </div>
  );
};

export default PasswordModal;
