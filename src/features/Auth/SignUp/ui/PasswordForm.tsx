import AuthContent from '@/shared/ui/AuthContent';
import { useFormContext } from 'react-hook-form';
import { SignUpMessageStore } from '../model/SignUpStore';

const PasswordForm = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const { message } = SignUpMessageStore();
  return (
    <div className="flex h-full flex-col gap-y-3">
      <AuthContent
        type="password"
        title="회원가입"
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
          {/* 이미 존재하는 이메일로 가입 시 에러 메세지 생성 */}
          {message}
        </span>
      </div>
    </div>
  );
};

export default PasswordForm;
