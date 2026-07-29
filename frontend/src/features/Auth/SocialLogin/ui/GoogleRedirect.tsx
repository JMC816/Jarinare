// @role: features/ui
// @rule: 구글 OAuth 콜백 로딩 화면
import loading from '@/assets/icons/loading.png';
import { useGoogleRedirect } from '../hooks/useGoogleLogin';

const GoogleRedirect = () => {
  useGoogleRedirect();
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <img src={loading} className="h-12 w-12 animate-spin" />
    </div>
  );
};

export default GoogleRedirect;
