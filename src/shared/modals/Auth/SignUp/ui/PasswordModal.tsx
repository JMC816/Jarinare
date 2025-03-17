import SignUpButton from '@/shared/ui/SignUpButton';
import SignUpContant from './SignUpContant';
import { Link } from 'react-router-dom';

const PasswordModal = () => {
  return (
    <div className="flex h-full w-full flex-col items-center bg-lightestGray pl-[38px] pr-[37px]">
      <SignUpContant
        title="회원가입"
        subtitle="비밀번호"
        placeholder="비밀번호"
      />
      <Link to={'/'}>
        <SignUpButton
          stage="3단계"
          text="회원가입"
          bgColor="blue"
          textColor="white"
          modalTypes={'PasswordModal'}
        />
      </Link>
    </div>
  );
};

export default PasswordModal;
