export type SignUpStoreType = {
  email: string;
  password: string;
  name: string;
  setSignUp: (name: 'email' | 'password' | 'name', value: string) => void;
};

export type LoadingStoreType = {
  isLoading: boolean;
  setIsLoading: (type: boolean) => void;
};
