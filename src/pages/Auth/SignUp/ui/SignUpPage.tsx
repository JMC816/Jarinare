import { SignUp } from '@/features/Auth/SignUp/model/SignUpSchema';
import EmailForm from '@/features/Auth/SignUp/ui/EmailForm';
import Modal from '@/widgets/Auth/SignUp/ui/Modal';
import SignUpStageLine from '@/widgets/Auth/SignUp/ui/SignUpStageLine';
import BackWardPageButton from '@/widgets/layouts/ui/BackWardPageButton';
import useModalStore from '@/widgets/model/AuthStore';
import { FormProvider } from 'react-hook-form';
import { useEmailCheck } from '@/features/Auth/SignUp/hooks/useEmailCheck';
import { EmailErrorStore } from '@/features/Auth/SignUp/model/SignUpStore';
import { useEffect, useCallback } from 'react';

const SignUpPage = () => {
  const { isShow, modalType, openModal } = useModalStore();
  const { method } = SignUp();
  const { checkEmailExists, isChecking } = useEmailCheck();
  const { setEmailError } = EmailErrorStore();

  const handleNextClick = useCallback(async () => {
    // 이메일 유효성 검사
    const email = method.getValues('email');
    if (method.formState.errors.email || email === '') {
      return;
    }

    // 이메일 중복 체크
    const isAvailable = await checkEmailExists(email);
    if (isAvailable) {
      setEmailError('');
      openModal('NameModal');
    }
  }, [method, checkEmailExists, setEmailError, openModal]);

  // 엔터키 이벤트 핸들러
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isChecking) {
        handleNextClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isChecking, handleNextClick]);

  return (
    <FormProvider {...method}>
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex h-[667px] w-[375px] flex-col items-center bg-lightestGray pl-[38px] pr-[37px]">
          <BackWardPageButton />
          <EmailForm />
          <SignUpStageLine stage={1} width={100} borderRadius="xl" />
          <div className="mb-[45px] flex flex-col">
            <button
              type="button"
              onClick={handleNextClick}
              disabled={isChecking}
              className={`relative flex h-12 w-[300px] items-center justify-center rounded-sm bg-blue text-base font-bold text-white active:brightness-50 disabled:bg-blue/30`}
            >
              {isChecking ? '확인 중...' : '다음'}
            </button>
          </div>
          {isShow == false || modalType == undefined ? null : <Modal />}
        </div>
      </div>
    </FormProvider>
  );
};

export default SignUpPage;
