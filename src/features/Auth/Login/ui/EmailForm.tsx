import AuthContent from '@/shared/ui/AuthContent';
import { useLoginState } from '../hooks/useLoginState';

const EmailForm = () => {
  const { login, onChange } = useLoginState();
  return (
    <AuthContent
      title="로그인"
      subtitle="이메일"
      placeholder="이메일"
      name="email"
      value={login.email}
      onChange={onChange}
    />
  );
};

export default EmailForm;
