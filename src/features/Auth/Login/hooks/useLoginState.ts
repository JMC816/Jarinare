import React, { useCallback } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/shared/firebase/firebase';
import { useNavigate } from 'react-router-dom';
import { LoadingStore, LoginStore } from '../model/useLoginStore';

export const useLoginState = () => {
  const { email, password, setLogin } = LoginStore();
  const { isLoading, setIsLoading } = LoadingStore();
  const navigate = useNavigate();

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setLogin(name as 'email' | 'password', value);
    },
    [setLogin],
  );

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (isLoading || email === '' || password === '') return;
      try {
        setIsLoading(true);
        const credentials = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );
        console.log(credentials.user);
        navigate('/');
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, email, password],
  );
  return { login: { email, password }, onChange, onSubmit, isLoading };
};
