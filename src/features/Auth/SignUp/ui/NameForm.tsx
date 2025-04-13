import AuthContent from '@/shared/ui/AuthContent';
import { useSignUpState } from '../hooks/useSignUpState';

const NameForm = () => {
  const { signUp, onChange } = useSignUpState();
  return (
    <AuthContent
      title="회원가입"
      subtitle="이름"
      placeholder="이름"
      name="name"
      value={signUp.name}
      onChange={onChange}
    />
  );
};

export default NameForm;
