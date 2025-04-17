import AuthContent from '@/shared/ui/AuthContent';
import { useFormContext } from 'react-hook-form';
import { LoginMessageStore } from '../model/useLoginStore';

const PasswordForm = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const { message } = LoginMessageStore();
  return (
    <div className="flex h-full flex-col gap-y-3">
      <AuthContent
        title="로그인"
        subtitle="비밀번호"
        placeholder="비밀번호"
        name={register('password')}
      />
      <div className="flex flex-col gap-y-3 text-base font-bold text-red">
        <span className="animate-bounce">
          {/* 비밀번호 에러 발생 시에만 에러 메세지 생성 */}
          {errors.password == undefined
            ? null
            : String(errors.password?.message)}
        </span>
        <span className="animate-bounce">
          {/* 등록되지 않은 사용자거나 비밀번호 불일치 시 에러 메세지 생성 */}
          {message}
        </span>
      </div>
    </div>
  );
};

export default PasswordForm;
