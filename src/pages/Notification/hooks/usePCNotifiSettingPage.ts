/**
 * @role: pages/Notification — hooks
 * @rule: 알림 설정 페이지 인증 상태·네비게이션만 담당
 */
import { useNavigate } from 'react-router-dom';
import { auth } from '@/shared/firebase/firebase';

export const usePCNotifiSettingPage = () => {
  const navigate = useNavigate();

  return {
    isLoggedIn: !!auth.currentUser,
    handleLoginNavigate: () => navigate('/auth/login'),
  };
};
