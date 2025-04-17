import { create } from 'zustand';
import { LoadingStoreType, SignUpMessageType } from '../types/SignUpType';

export const LoadingStore = create<LoadingStoreType>((set) => ({
  isLoading: false,
  setIsLoading: () => set((state) => ({ isLoading: !state.isLoading })),
}));

export const SignUpMessageStore = create<SignUpMessageType>((set) => ({
  message: '',
  setMessage: (message: string) => set(() => ({ message })),
}));
