import React from 'react';
import { AuthContentsProps } from '../types/AuthType';
import AuthInput from './AuthInput';

const AuthContent = React.memo(
  ({
    title,
    subtitle,
    placeholder,
    name,
    value,
    onChange,
  }: AuthContentsProps) => {
    return (
      <div className="mb-[45px] flex h-full w-full flex-col justify-between">
        <div className="mt-[45px]">
          <span className="text-lg font-bold">{title}</span>
          <div className="mt-[40px]">
            <span className="text-tiny font-bold">{subtitle}</span>
            <AuthInput
              name={name}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
            />
          </div>
        </div>
      </div>
    );
  },
);

AuthContent.displayName = 'AuthContent';

export default AuthContent;
