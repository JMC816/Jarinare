import LoginList from '@/widgets/Auth/Login/ui/LoginList';
import SocialLoginList from '@/widgets/Auth/Login/ui/SocialLoginList';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  return (
    <div className="mt-[35px] flex h-full w-full flex-col items-center bg-lightestGray pl-[38px] pr-[37px]">
      <span className="w-full">로그인</span>
      <div className="mt-[65px]">
        <LoginList />
      </div>
      <div className="before:content-[' '] after:content-[' '] mb-[30px] mt-[30px] flex w-full items-center gap-[16px] before:h-[1px] before:flex-grow before:bg-mediumGray after:h-[1px] after:flex-grow after:bg-mediumGray">
        또는
      </div>
      <SocialLoginList />
      <Link className="mt-[30px] font-bold text-blue" to={'/auth/signup'}>
        회원가입
      </Link>
    </div>
  );
};

export default LoginPage;
