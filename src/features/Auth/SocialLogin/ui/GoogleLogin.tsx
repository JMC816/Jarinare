import google from '@/assets/social/google.png';
import { useGoogleLogin } from '../hooks/useGoogleLogin';

const GoogleLogin = () => {
  const { onClick } = useGoogleLogin();
  return (
    <button
      onClick={onClick}
      className="relative flex h-12 w-[300px] items-center justify-center rounded-sm bg-white text-base font-bold text-black active:brightness-50 disabled:bg-lightBlueImpossible"
    >
      <img
        className="absolute left-[20px]"
        width={20}
        height={20}
        src={google}
      />
      구글 로그인
    </button>
  );
};

export default GoogleLogin;
