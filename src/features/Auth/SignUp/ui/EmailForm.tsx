import AuthContent from '@/shared/ui/AuthContent';
import { useFormContext } from 'react-hook-form';

const EmailForm = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  return (
    <div className="flex h-full flex-col gap-y-3">
      <AuthContent
        type="email"
        title="회원가입"
        subtitle="이메일"
        placeholder="이메일"
        name={register('email')}
      />
      <span className="animate-bounce text-base font-bold text-red">
        {/* 이메일 에러 발생 시에만 에러 메세지 생성 */}
        {errors.email == undefined ? null : String(errors.email?.message)}
      </span>
    </div>
  );
};

export default EmailForm;
