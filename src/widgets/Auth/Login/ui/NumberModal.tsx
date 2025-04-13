import AuthContent from '@/shared/ui/AuthContent';
import LoginButton from './LoginButton';
import useModalStore from '@/widgets/model/AuthStore';
import BackWardModalButton from '@/widgets/layouts/ui/BackWardModalButton';
import LoginStageLine from './LoginStageLine';

const NumberModal = () => {
  const { closeModal } = useModalStore();
  return (
    <div className="flex h-full w-full flex-col items-center bg-lightestGray pl-[38px] pr-[37px]">
      <BackWardModalButton closeModal={() => closeModal('NumberModal')} />
      <AuthContent
        title="로그인"
        subtitle="휴대폰 번호"
        placeholder="휴대폰 번호"
      />
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

export default NumberModal;
