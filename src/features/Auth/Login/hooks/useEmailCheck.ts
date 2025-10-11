import { auth } from '@/shared/firebase/firebase';
import { fetchSignInMethodsForEmail } from 'firebase/auth';
import { useState } from 'react';
import { EmailErrorStore } from '../model/useLoginStore';

export const useEmailCheck = () => {
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const { setEmailError } = EmailErrorStore();

  const checkEmailExists = async (email: string): Promise<boolean> => {
    if (!email) {
      return false;
    }

    try {
      setIsChecking(true);
      setEmailError('');

      // Firebase에서 이메일이 등록되어 있는지 확인
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);

      if (signInMethods.length === 0) {
        // 이메일이 등록되지 않음
        setEmailError('등록되지 않은 이메일 입니다.');
        return false;
      }

      // 등록된 이메일
      return true;
    } catch (error) {
      console.error('이메일 확인 중 오류:', error);
      setEmailError('이메일 확인 중 오류가 발생했습니다.');
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  return { checkEmailExists, isChecking };
};
