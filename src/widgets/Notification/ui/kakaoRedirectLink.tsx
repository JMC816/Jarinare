import loading from '@/assets/icons/loading.png';
import { useKakaoRedirectLink } from '../../../features/Notification/hooks/useKakaoLink';

// 카카오 API 요청시 로딩창 생성
const KakaoRedirectLink = () => {
  useKakaoRedirectLink();
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <img src={loading} className="h-12 w-12 animate-spin" />
    </div>
  );
};

export default KakaoRedirectLink;
