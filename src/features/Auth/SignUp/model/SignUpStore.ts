import { create } from 'zustand';
import { LoadingStoreType, SignUpStoreType } from '../types/SignUpType';

export const SignUpStore = create<SignUpStoreType>((set) => ({
  email: '',
  password: '',
  name: '',
  setSignUp: (name, value) =>
    set((state) => ({
      ...state,
      [name]: value,
    })),
}));

export const LoadingStore = create<LoadingStoreType>((set) => ({
  isLoading: false,
  setIsLoading: () => set((state) => ({ isLoading: !state.isLoading })),
}));
