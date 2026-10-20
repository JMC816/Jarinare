/**
 * @role: pages — /board/:id 라우트 진입점
 * @rule: type에 맞는 상세 컴포넌트 렌더링만 담당, 비즈니스 로직 포함 금지
 */
import { useSearchParams } from 'react-router-dom';
import BoardDetailPage from './BoardDetailPage';
import PCNoticeDetailPage from './PCNoticeDetailPage';
import EventDetailPage from './EventDetailPage';

const BoardByIdPage = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') ?? 'free';

  if (type === 'notice') return <PCNoticeDetailPage />;
  if (type === 'event') return <EventDetailPage />;
  return <BoardDetailPage />;
};

export default BoardByIdPage;
