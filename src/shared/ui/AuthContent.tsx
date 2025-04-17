import { AuthContentsProps } from '../types/AuthType';
import AuthInput from './AuthInput';

const AuthContent = ({
  title,
  subtitle,
  placeholder,
  name,
}: AuthContentsProps) => {
  return (
    <div className="mt-[45px]">
      <span className="text-lg font-bold">{title}</span>
      <div className="mt-[40px]">
        <span className="text-tiny font-bold">{subtitle}</span>
        <AuthInput name={name} placeholder={placeholder} />
      </div>
    </div>
  );
};

export default AuthContent;
