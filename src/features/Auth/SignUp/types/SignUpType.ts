export type LoadingStoreType = {
  isLoading: boolean;
  setIsLoading: (type: boolean) => void;
};

export type SignUpMessageType = {
  message: string;
  setMessage: (type: string) => void;
};

export type EmailErrorType = {
  emailError: string;
  setEmailError: (error: string) => void;
};
