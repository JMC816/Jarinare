export type LoginStoreType = {
  email: string;
  password: string;
  setLogin: (name: 'email' | 'password', value: string) => void;
};

export type LoadingStoreType = {
  isLoading: boolean;
  setIsLoading: (type: boolean) => void;
};
