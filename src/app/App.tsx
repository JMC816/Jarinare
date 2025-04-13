import { useEffect, useState } from 'react';
import Router from './routes';
import LoadingScreen from '@/widgets/layouts/ui/LoadingScreen';
import { auth } from '@/shared/firebase/firebase';

function App() {
  const [isLoading, setLoading] = useState(true);
  const init = async () => {
    // 인증 준비 상태
    await auth.authStateReady();
    setLoading(false);
  };
  useEffect(() => {
    init();
  }, []);
  // 인증 상태에 따라 로딩창 또는 라우터 렌더링
  return isLoading ? <LoadingScreen /> : <Router />;
}

export default App;
