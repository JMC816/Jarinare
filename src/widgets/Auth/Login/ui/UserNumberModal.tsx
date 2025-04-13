import AuthContent from '@/shared/ui/AuthContent';
import LoginButton from './LoginButton';
import BackWardModalButton from '@/widgets/layouts/ui/BackWardModalButton';
import useModalStore from '@/widgets/model/AuthStore';
import LoginStageLine from './LoginStageLine';

const UserNumberModal = () => {
  const { closeModal } = useModalStore();
  return (
    <div className="flex h-full w-full flex-col items-center bg-lightestGray pl-[38px] pr-[37px]">
      <BackWardModalButton closeModal={() => closeModal('UserNumberModal')} />
      <AuthContent title="로그인" subtitle="회원번호" placeholder="회원번호" />
      <LoginStageLine stage={1} width={150} borderRadius="xl" />
      <LoginButton
        text="다음"
        bgColor="blue"
        textColor="white"
        modalTypes={'PasswordModal'}
      />
    </div>
  );
};

export default UserNumberModal;
