import LoginButton from '@/shared/ui/LoginButton';
import { LoginContants } from '../types/Login';
import LoginInput from './LoginInput';
import useModalStore from '../model/store';
import { Link } from 'react-router-dom';
import LoginStageLine from './LoginStageLine';

const LoginContant = ({
  title,
  subtitle,
  placeholder,
  stage,
}: LoginContants) => {
  const { modalType } = useModalStore();
  return (
    <div className="mb-[45px] flex h-full w-full flex-col justify-between">
      <div className="mt-[55px]">
        <span className="text-lg font-bold">{title}</span>
        <div className="mt-[40px]">
          <span className="text-tiny font-bold">{subtitle}</span>
          <LoginInput placeholder={placeholder} />
        </div>
      </div>
      <div className="flex flex-col gap-y-5">
        <LoginStageLine stage={stage} />
        {modalType === 'PasswordModal' ? (
          <Link to={'/'}>
            <LoginButton
              text="로그인"
              bgColor="blue"
              textColor="white"
              modalTypes={'PasswordModal'}
            />
          </Link>
        ) : (
          <LoginButton
            text="다음"
            bgColor="blue"
            textColor="white"
            modalTypes={'PasswordModal'}
          />
        )}
      </div>
    </div>
  );
};

export default LoginContant;
