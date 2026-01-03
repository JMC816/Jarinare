import { Login } from '@/features/Auth/Login/model/LoginSchema';
import LoginList from '@/widgets/Auth/Login/ui/LoginList';
import Modal from '@/widgets/Auth/Login/ui/Modal';
import SocialLoginList from '@/widgets/Auth/Login/ui/SocialLoginList';
import BackWardPageButton from '@/widgets/layouts/ui/BackWardPageButton';
import useModalStore from '@/widgets/model/AuthStore';
import { FormProvider } from 'react-hook-form';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const { isShow, modalType } = useModalStore();
  const { method } = Login();
  return (
    <FormProvider {...method}>
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex h-[667px] w-[375px] flex-col items-center bg-lightestGray pl-[38px] pr-[37px]">
          <BackWardPageButton />
          <span className="mt-5 w-full text-lg font-bold">로그인</span>
          <div className="mt-[35px]">
            <LoginList />
          </div>
          <div className="before:content-[' '] after:content-[' '] mb-[30px] mt-[30px] flex w-full items-center gap-[10px] text-xs text-mediumGray before:h-[1px] before:flex-grow before:bg-mediumGray after:h-[1px] after:flex-grow after:bg-mediumGray">
            또는
          </div>
          <SocialLoginList />
          <div className="mt-[30px] flex w-full flex-col items-center gap-y-2">
            <span className="text-sm text-mediumGray">회원이 아니신가요?</span>
            <Link
              className="relative flex h-12 w-[300px] items-center justify-center rounded-md border border-lightGray bg-white text-base font-bold text-blue shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95"
              to={'/auth/signup'}
            >
              회원가입
            </Link>
          </div>
          {isShow == false || modalType == undefined ? null : <Modal />}
        </div>
      </div>
    </FormProvider>
  );
};

export default LoginPage;
