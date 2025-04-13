import AuthContent from '@/shared/ui/AuthContent';
import { useLoginState } from '../hooks/useLoginState';

const PasswordForm = () => {
  const { login, onChange } = useLoginState();
  return (
    <AuthContent
      title="로그인"
      subtitle="비밀번호"
      placeholder="비밀번호"
      name="password"
      value={login.password}
      onChange={onChange}
    />
  );
};

export default PasswordForm;
