import { create } from 'zustand';
import {
  LoadingStoreType,
  SignUpMessageType,
  EmailErrorType,
} from '../types/SignUpType';

export const LoadingStore = create<LoadingStoreType>((set) => ({
  isLoading: false,
  setIsLoading: () => set((state) => ({ isLoading: !state.isLoading })),
}));

export const SignUpMessageStore = create<SignUpMessageType>((set) => ({
  message: '',
  setMessage: (message: string) => set(() => ({ message })),
}));

export const EmailErrorStore = create<EmailErrorType>((set) => ({
  emailError: '',
  setEmailError: (error: string) => set(() => ({ emailError: error })),
}));
