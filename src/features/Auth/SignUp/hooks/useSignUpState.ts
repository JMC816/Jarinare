import React from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/shared/firebase/firebase';
import { useNavigate } from 'react-router-dom';
import { LoadingStore, SignUpMessageStore } from '../model/SignUpStore';
import { FieldValues, UseFormGetValues } from 'react-hook-form';
import { FirebaseError } from 'firebase/app';

export const useSignUpState = (getValues: UseFormGetValues<FieldValues>) => {
  const navigate = useNavigate();
  const { isLoading, setIsLoading } = LoadingStore();
  const { message, setMessage } = SignUpMessageStore();
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      // 이메일과 비밀번호로 회원가입
      const credentials = await createUserWithEmailAndPassword(
        auth,
        getValues('email'),
        getValues('password'),
      );
      // 사용자 프로필 업데이트
      await updateProfile(credentials.user, {
        displayName: getValues('name'),
      });
      navigate('/');
    } catch (e) {
      if (e instanceof FirebaseError) {
        switch (e.code) {
          case 'auth/email-already-in-use':
            return setMessage('이미 사용 중인 이메일 입니다.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { onSubmit, isLoading, message, setMessage };
};
