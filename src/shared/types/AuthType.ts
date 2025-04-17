import { UseFormRegisterReturn } from 'react-hook-form';

export type AuthContentsProps = {
  title: string;
  subtitle: string;
  placeholder: string;
  name:
    | UseFormRegisterReturn<'email'>
    | UseFormRegisterReturn<'name'>
    | UseFormRegisterReturn<'password'>;
};

export type AuthInputProps = {
  placeholder: string;
  name:
    | UseFormRegisterReturn<'email'>
    | UseFormRegisterReturn<'name'>
    | UseFormRegisterReturn<'password'>;
};
