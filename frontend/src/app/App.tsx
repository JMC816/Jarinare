import Router from './routes';
import Intro from '@/widgets/Intro/ui/Intro';
import { useIsIntro } from '@/features/Intro/hooks/useIsIntro';

function App() {
  const isTicketView = window.location.pathname === '/ticket/view';
  const { isIntro } = useIsIntro();
  if (isTicketView) return <Router />;
  return isIntro ? <Intro /> : <Router />;
}

export default App;
