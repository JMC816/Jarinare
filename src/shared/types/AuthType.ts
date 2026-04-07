import { UseFormRegisterReturn } from 'react-hook-form';

export type AuthContentsProps = {
  title: string;
  subtitle: string;
  placeholder?: string;
  name?:
    | UseFormRegisterReturn<'email'>
    | UseFormRegisterReturn<'name'>
    | UseFormRegisterReturn<'password'>;
  type: string;
};

export type AuthInputProps = {
  placeholder?: string;
  name?:
    | UseFormRegisterReturn<'email'>
    | UseFormRegisterReturn<'name'>
    | UseFormRegisterReturn<'password'>;
  type: string;
};

export type AgeType = '10대' | '20대' | '30대' | '40대' | '50대' | '60대+';
