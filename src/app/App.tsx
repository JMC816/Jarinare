import { useEffect, useState } from 'react';
import Router from './routes';
import LoadingScreen from '@/widgets/layouts/ui/LoadingScreen';
import { auth, db } from '@/shared/firebase/firebase';
import Intro from '@/widgets/Intro/ui/Intro';
import { useIsIntro } from '@/features/Intro/hooks/useIsIntro';
import { doc, setDoc } from 'firebase/firestore';

function App() {
  const isTicketView = window.location.pathname === '/ticket/view';
  const [isLoading, setLoading] = useState(!isTicketView);
  const { isIntro } = useIsIntro();
  const init = async () => {
    await auth.authStateReady();
    // 알림 전송 대상 조회를 위해 로그인 사용자 등록
    const user = auth.currentUser;
    if (user) {
      await setDoc(
        doc(db, 'users', user.uid),
        { uid: user.uid, name: user.displayName ?? user.uid },
        { merge: true },
      );
    }
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
