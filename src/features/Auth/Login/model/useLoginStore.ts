import { create } from 'zustand';
import { LoadingStoreType, LoginStoreType } from '../types/LoginType';

export const LoginStore = create<LoginStoreType>((set) => ({
  email: '',
  password: '',
  setLogin: (name, value) =>
    set((state) => ({
      ...state,
      [name]: value,
    })),
}));

export const LoadingStore = create<LoadingStoreType>((set) => ({
  isLoading: false,
  setIsLoading: () => set((state) => ({ isLoading: !state.isLoading })),
}));
