import AuthContent from '@/shared/ui/AuthContent';
import { useSignUpState } from '../hooks/useSignUpState';

const PasswordForm = () => {
  const { signUp, onChange } = useSignUpState();
  return (
    <AuthContent
      title="회원가입"
      subtitle="비밀번호"
      placeholder="비밀번호"
      name="password"
      value={signUp.password}
      onChange={onChange}
    />
  );
};

export default PasswordForm;
