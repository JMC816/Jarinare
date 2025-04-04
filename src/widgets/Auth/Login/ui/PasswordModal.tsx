import { Link } from 'react-router-dom';
import AuthContent from '@/shared/ui/AuthContent';
import LoginButton from './LoginButton';

const PasswordModal = () => {
  return (
    <div className="flex h-full w-full flex-col items-center bg-lightestGray pl-[38px] pr-[37px]">
      <AuthContent title="로그인" subtitle="비밀번호" placeholder="비밀번호" />
      <Link to={'/'}>
        <LoginButton
          stage="2단계"
          text="로그인"
          bgColor="blue"
          textColor="white"
          modalTypes={'PasswordModal'}
        />
      </Link>
    </div>
  );
};

export default PasswordModal;
