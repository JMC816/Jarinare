import React from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/shared/firebase/firebase';
import { useNavigate } from 'react-router-dom';
import { LoadingStore, LoginMessageStore } from '../model/useLoginStore';
import { FieldValues, UseFormGetValues } from 'react-hook-form';
import { FirebaseError } from 'firebase/app';

export const useLoginState = (getValues: UseFormGetValues<FieldValues>) => {
  const navigate = useNavigate();
  const { isLoading, setIsLoading } = LoadingStore();
  const { setMessage } = LoginMessageStore();
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      // 이메일과 비밀번호로 로그인
      await signInWithEmailAndPassword(
        auth,
        getValues('email'),
        getValues('password'),
      );
      navigate('/');
    } catch (e) {
      if (e instanceof FirebaseError) {
        switch (e.code) {
          case 'auth/user-not-found':
            return setMessage('등록되지 않은 사용자 입니다.');
          case 'auth/wrong-password':
            return setMessage('비밀번호가 일치하지 않습니다.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { onSubmit, isLoading };
};
