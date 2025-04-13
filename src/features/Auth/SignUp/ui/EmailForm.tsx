import AuthContent from '@/shared/ui/AuthContent';
import { useSignUpState } from '../hooks/useSignUpState';

const EmailForm = () => {
  const { signUp, onChange } = useSignUpState();
  return (
    <AuthContent
      title="회원가입"
      subtitle="이메일"
      placeholder="이메일"
      name="email"
      value={signUp.email}
      onChange={onChange}
    />
  );
};

export default EmailForm;
