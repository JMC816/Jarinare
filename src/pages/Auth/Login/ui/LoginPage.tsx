import useModalStore from '@/shared/modals/model/store';
import LoginList from '@/widgets/Auth/Login/ui/LoginList';
import SocialLoginList from '@/widgets/Auth/Login/ui/SocialLoginList';
import Modal from '@/widgets/modals/Auth/Login/ui/Modal';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const { isShow, modalType } = useModalStore();
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-lightestGray pl-[38px] pr-[37px]">
      <span className="w-full text-lg font-bold">로그인</span>
      <div className="mt-[65px]">
        <LoginList />
      </div>
      <div className="before:content-[' '] after:content-[' '] mb-[30px] mt-[30px] flex w-full items-center gap-[10px] text-xs text-mediumGray before:h-[1px] before:flex-grow before:bg-mediumGray after:h-[1px] after:flex-grow after:bg-mediumGray">
        또는
      </div>
      <SocialLoginList />
      <Link
        className="mt-[30px] text-md font-bold text-blue"
        to={'/auth/signup'}
      >
        회원가입
      </Link>
      {isShow == false || modalType == undefined ? null : <Modal />}
    </div>
  );
};

export default LoginPage;
