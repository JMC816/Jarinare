/**
 * @role: pages — PC 통합 글 작성 페이지 (분류 선택 가능)
 * @rule: 레이아웃·조합만 담당, 비즈니스 로직 포함 금지
 */
import { useState } from 'react';
import { useBaordHandler } from '@/features/Board/hooks/useBoardHandler';
import { useNoticeHandler } from '@/features/Board/hooks/useNoticeHandler';
import { useEventHandler } from '@/features/Board/hooks/useEventHandler';
import PCWriteForm from '@/widgets/Board/ui/PCWriteForm';
import LoadingScreen from '@/widgets/Board/ui/LoadingScreen';
import { WriteCategory } from '@/widgets/Board/types/boardWidgetType';

const CATEGORY_LABEL: Record<WriteCategory, string> = {
  board: '자유',
  notice: '공지',
  event: '이벤트',
};

const PCUnifiedWritePage = () => {
  const [category, setCategory] = useState<WriteCategory>('board');

  const board = useBaordHandler();
  const notice = useNoticeHandler();
  const event = useEventHandler();

  const activeHandler =
    category === 'board' ? board : category === 'notice' ? notice : event;

  const isLoading = activeHandler.loading;

  return (
    <>
      <PCWriteForm
        {...activeHandler}
        categoryLabel={CATEGORY_LABEL[category]}
        backLabel="게시판"
        categorySelectable
        selectedCategory={category}
        onCategoryChange={setCategory}
      />
      {isLoading && <LoadingScreen />}
    </>
  );
};

export default PCUnifiedWritePage;
