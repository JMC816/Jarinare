/**
 * @role: pages — 즐겨찾기 목록 페이지 (PC + 모바일)
 * @rule: 레이아웃·조합만 담당, 비즈니스 로직 포함 금지
 */
import backward from '@/assets/icons/backward.png';
import { useNavigate } from 'react-router-dom';
import PCFavoriteListPage from './PCFavoriteListPage';
import { usePCFavoriteListPage } from '../hooks/usePCFavoriteListPage';

const FavoriteListPage = () => {
  const navigate = useNavigate();
  const { pagedData, filteredData, isLoading, formatDate } = usePCFavoriteListPage();

  return (
    <>
      <div className="hidden w-full lg:block">
        <PCFavoriteListPage />
      </div>
      <div className="flex h-screen w-full flex-col bg-gray-100 lg:hidden">
        {/* 헤더 */}
        <div className="flex w-full items-center bg-white px-[27px] py-4 shadow-sm">
          <img
            onClick={() => navigate(-1)}
            src={backward}
            className="h-[20px] w-[12px] cursor-pointer"
          />
          <h1 className="ml-4 text-lg font-bold">즐겨찾기</h1>
        </div>

        <div className="flex-1 overflow-y-auto pb-[80px]">
          {isLoading ? (
            <div className="flex h-20 items-center justify-center text-sm text-gray-400">
              불러오는 중...
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex h-20 items-center justify-center text-sm text-gray-400">
              즐겨찾기한 게시물이 없습니다
            </div>
          ) : (
            pagedData.map((post) => (
              <button
                key={post.id}
                onClick={() =>
                  navigate(`/board/${post.id}?type=free`, { state: { post } })
                }
                className="flex w-full flex-col gap-1 border-b border-gray-100 bg-white px-5 py-4 text-left"
              >
                <span className="truncate text-sm font-bold text-gray-800">
                  {post.title}
                </span>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{post.author}</span>
                  <span>·</span>
                  <span>{formatDate(post.createdAt)}</span>
                  <span>·</span>
                  <span>조회 {post.views ?? 0}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default FavoriteListPage;
