import { useKakaoLogin } from '../hooks/useKakaoLogin';
import kakao from '@/assets/social/kakao.png';

const KakaoLogin = () => {
  const { onClick } = useKakaoLogin();
  return (
    <button
      onClick={onClick}
      className="relative flex h-12 w-[300px] items-center justify-center rounded-sm bg-white text-base font-bold text-black active:brightness-50 disabled:bg-lightBlueImpossible"
    >
      <img
        className="absolute left-[20px]"
        width={20}
        height={20}
        src={kakao}
      />
      카카오 로그인
    </button>
  );
};

export default KakaoLogin;
