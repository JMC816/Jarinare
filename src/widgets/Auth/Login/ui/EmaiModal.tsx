import EmailForm from '@/features/Auth/Login/ui/EmailForm';
import BackWardModalButton from '@/widgets/layouts/ui/BackWardModalButton';
import useModalStore from '@/widgets/model/AuthStore';
import LoginStageLine from './LoginStageLine';
import { useFormContext } from 'react-hook-form';
import { useEmailCheck } from '@/features/Auth/Login/hooks/useEmailCheck';
import { EmailErrorStore } from '@/features/Auth/Login/model/useLoginStore';
import { useCallback, useEffect } from 'react';

const EmailModal = () => {
  const { closeModal, openModal } = useModalStore();
  const {
    formState: { errors },
    getValues,
  } = useFormContext();
  const { checkEmailExists, isChecking } = useEmailCheck();
  const { setEmailError } = EmailErrorStore();

  const handleNextClick = useCallback(async () => {
    // 이메일 유효성 검사
    const email = getValues('email');
    if (errors.email || email === '') {
      return;
    }

    // 이메일 등록 확인
    const isRegistered = await checkEmailExists(email);
    if (isRegistered) {
      setEmailError('');
      openModal('PasswordModal');
    }
  }, [getValues, errors.email, checkEmailExists, setEmailError, openModal]);

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
    <div className="flex h-full w-full flex-col items-center bg-lightestGray pl-[38px] pr-[37px]">
      <BackWardModalButton closeModal={() => closeModal('EmailModal')} />
      <EmailForm />
      <LoginStageLine stage={1} width={150} borderRadius="xl" />
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
    </div>
  );
};

export default EmailModal;
