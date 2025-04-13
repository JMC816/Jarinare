import github from '@/assets/social/github.png';
import { useGithubLogin } from '../hooks/useGithubLogin';

const GithubLogin = () => {
  const { onClick } = useGithubLogin();
  return (
    <button
      onClick={onClick}
      className="relative flex h-12 w-[300px] items-center justify-center rounded-sm bg-white text-base font-bold text-black active:brightness-50 disabled:bg-lightBlueImpossible"
    >
      <img
        className="absolute left-[20px]"
        width={20}
        height={20}
        src={github}
      />
      깃허브 로그인
    </button>
  );
};

export default GithubLogin;
