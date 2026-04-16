import { useEffect, useState } from 'react';
import Router from './routes';
import LoadingScreen from '@/widgets/layouts/ui/LoadingScreen';
import { auth } from '@/shared/firebase/firebase';
import Intro from '@/widgets/Intro/ui/Intro';
import { useIsIntro } from '@/features/Intro/hooks/useIsIntro';

function App() {
  const isTicketView = window.location.pathname === '/ticket/view';
  const [isLoading, setLoading] = useState(!isTicketView);
  const { isIntro } = useIsIntro();
  const init = async () => {
    // 인증 준비 상태
    await auth.authStateReady();
    setLoading(false);
  };
  useEffect(() => {
    if (!isTicketView) init();
  }, []);
  // /ticket/view는 인증·인트로 없이 바로 렌더링
  if (isTicketView) return <Router />;
  return isIntro ? <Intro /> : isLoading ? <LoadingScreen /> : <Router />;
}

export default App;
