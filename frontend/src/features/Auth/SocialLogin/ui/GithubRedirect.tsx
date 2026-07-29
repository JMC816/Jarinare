// @role: features/ui
// @rule: 깃허브 OAuth 콜백 로딩 화면
import loading from '@/assets/icons/loading.png';
import { useGithubRedirect } from '../hooks/useGithubLogin';

const GithubRedirect = () => {
  useGithubRedirect();
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <img src={loading} className="h-12 w-12 animate-spin" />
    </div>
  );
};

export default GithubRedirect;
