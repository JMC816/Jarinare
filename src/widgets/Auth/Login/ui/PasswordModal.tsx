import BackWardModalButton from '@/widgets/layouts/ui/BackWardModalButton';
import LoginButton from './LoginButton';
import PasswordForm from '@/features/Auth/Login/ui/PasswordForm';
import useModalStore from '@/widgets/model/AuthStore';
import LoginStageLine from './LoginStageLine';
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
        openModal={() => openModal('EmailModal')}
        closeModal={() => closeModal('PasswordModal')}
      />
      <PasswordForm />
      <LoginStageLine stage={2} width={300} borderRadius="xl" />
      <LoginButton
        text="로그인"
        bgColor="blue"
        textColor="white"
        // 비밀번호 에러나 빈 값일 시 로그인 제한
        modalTypes={
          errors.password || getValues('password') == ''
            ? 'PasswordModal'
            : 'PasswordModal'
        }
      />
    </div>
  );
};

export default PasswordModal;
