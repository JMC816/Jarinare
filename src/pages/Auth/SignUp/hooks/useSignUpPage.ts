/**
 * @role: page
 * @rule: hooks — 상태·사이드이펙트·이벤트 핸들러 담당
 */
import { useCallback, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { SignUpSchema } from '@/features/Auth/SignUp/model/SignUpSchema';
import useModalStore from '@/widgets/model/AuthStore';
import { useEmailCheck } from '@/features/Auth/SignUp/hooks/useEmailCheck';
import { EmailErrorStore } from '@/features/Auth/SignUp/model/SignUpStore';

type SignUpForm = UseFormReturn<z.infer<typeof SignUpSchema>>;

export const useSignUpPage = (
  pcMethod: SignUpForm,
  mobileMethod: SignUpForm,
) => {
  const { openModal } = useModalStore();
  const { checkEmailExists, isChecking } = useEmailCheck();
  const { setEmailError } = EmailErrorStore();
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  const pcHandleNextClick = useCallback(async () => {
    const email = pcMethod.getValues('email');
    if (pcMethod.formState.errors.email || email === '') return;
    const isAvailable = await checkEmailExists(email);
    if (isAvailable) {
      setEmailError('');
      openModal('NameModal');
    }
  }, [pcMethod, checkEmailExists, setEmailError, openModal]);

  const mobileHandleNextClick = useCallback(async () => {
    const email = mobileMethod.getValues('email');
    if (mobileMethod.formState.errors.email || email === '') return;
    const isAvailable = await checkEmailExists(email);
    if (isAvailable) {
      setEmailError('');
      openModal('NameModal');
    }
  }, [mobileMethod, checkEmailExists, setEmailError, openModal]);

  return {
    pcHandleNextClick,
    mobileHandleNextClick,
    isChecking,
    isCapsLockOn,
    setIsCapsLockOn,
  };
};
