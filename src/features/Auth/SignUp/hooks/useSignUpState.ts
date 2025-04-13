import React, { useCallback } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/shared/firebase/firebase';
import { useNavigate } from 'react-router-dom';
import { LoadingStore, SignUpStore } from '../model/SignUpStore';

export const useSignUpState = () => {
  const { email, password, name, setSignUp } = SignUpStore();
  const { isLoading, setIsLoading } = LoadingStore();
  const navigate = useNavigate();

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setSignUp(name as 'email' | 'password' | 'name', value);
    },
    [setSignUp],
  );

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (isLoading || name === '' || email === '' || password === '') return;
      try {
        setIsLoading(true);
        const credentials = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        console.log(credentials.user);
        await updateProfile(credentials.user, { displayName: name });
        navigate('/');
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, email, password, name],
  );
  return { signUp: { email, name, password }, onChange, onSubmit, isLoading };
};
