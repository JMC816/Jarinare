import { auth } from '@/shared/firebase/firebase';
import { fetchSignInMethodsForEmail } from 'firebase/auth';
import { useState } from 'react';
import { EmailErrorStore } from '../model/SignUpStore';

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

      // Firebase에서 이메일이 이미 등록되어 있는지 확인
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);

      if (signInMethods.length > 0) {
        // 이메일이 이미 사용 중
        setEmailError('이미 사용 중인 이메일 입니다.');
        return false;
      }

      // 사용 가능한 이메일
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
