import backward from '@/assets/icons/backward.png';
import { BoardDetail, BoardPost } from '@/entities/Board/types/boardType';
import { formatBoardTime } from '@/shared/lib/formatDate';
import { getProfileColor } from '@/shared/lib/profileColor';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { toBackendImageUrl } from '@/shared/api/backendClient';
import { getBoardDetailApi } from '@/features/Board/api/getBoardApi';
import { useBoardRead } from '@/features/Board/hooks/useBoardRead';
import { usePCNoticeDetailPage } from '../hooks/usePCNoticeDetailPage';
import PCNoticeDetailPage from './PCNoticeDetailPage';


const NoticeDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [fetchedNotice, setFetchedNotice] = useState<BoardDetail | null>(null);

  const stateNotice = location.state?.notice as BoardPost | undefined;
  const notice = fetchedNotice ?? stateNotice ?? undefined;

  const { markRead } = useBoardRead();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!id || hasFetched.current) return;
    hasFetched.current = true;
    if (!stateNotice || !stateNotice.content) {
      getBoardDetailApi(Number(id), 'notice').then(setFetchedNotice).catch(() => {});
    }
    markRead(Number(id));
  }, [id]);

  const { currentNotice, isOwner, viewCount, menuOpen, setMenuOpen, handleDelete, handleEdit } =
    usePCNoticeDetailPage(notice);

  if (!currentNotice) {
    return (
      <>
        <div className="hidden w-full lg:block">
          <PCNoticeDetailPage />
        </div>
        <div className="flex h-screen w-full items-center justify-center lg:hidden">
          <p className="text-gray-400">게시글을 찾을 수 없습니다.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="hidden w-full lg:block">
        <PCNoticeDetailPage />
      </div>

      <div className="flex h-screen w-full flex-col bg-gray-50 lg:hidden">
        {/* 헤더 */}
        <div className="shrink-0 flex w-full items-center bg-white/80 px-[28px] pb-[4px] pt-[20px] backdrop-blur-md">
          <div className="flex items-center gap-3">
            <img onClick={() => navigate(-1)} src={backward} className="h-[20px] w-[12px] cursor-pointer" />
            <span className="text-lg font-bold">공지사항</span>
          </div>
        </div>
        <div className="shrink-0 h-2 w-full border-b border-gray-200/50 bg-white/80" />

        {/* 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-4 my-4 overflow-hidden rounded-xl bg-white shadow-sm">
            {/* 제목 영역 */}
            <div className="px-5 pb-4 pt-5">
              <span className="mb-2 inline-block rounded px-2 py-0.5 text-xs font-bold" style={{ backgroundColor: '#dbeafe', color: '#2563eb' }}>
                공지
              </span>
              <h1 className="mb-3 text-xl font-black leading-snug text-gray-900">
                {currentNotice.title}
              </h1>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: getProfileColor(currentNotice.author ?? '') }}
                  >
                    {currentNotice.author?.charAt(0) ?? '?'}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-gray-800">{currentNotice.author}</span>
                    <span className="text-xs text-gray-400">
                      {formatBoardTime(currentNotice.createdAt)} · 조회 {viewCount}
                    </span>
                  </div>
                </div>
                {isOwner && (
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen((v) => !v)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
                    >
                      ···
                    </button>
                    {menuOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                        <div className="absolute right-0 top-9 z-20 min-w-[80px] overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg">
                          <button
                            onClick={() => { handleEdit(); setMenuOpen(false); }}
                            className="block w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50"
                          >
                            수정
                          </button>
                          <button
                            onClick={handleDelete}
                            className="hover:bg-red-50 block w-full px-4 py-2.5 text-left text-sm text-red"
                          >
                            삭제
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 구분선 */}
            <div className="mx-5 h-px bg-gray-100" />

            {/* 본문 */}
            <div className="px-5 pb-5 pt-4">
              {currentNotice.imageUrl && (
                <div className="mb-4 overflow-hidden rounded-lg">
                  <img
                    src={toBackendImageUrl(currentNotice.imageUrl) ?? ''}
                    alt={currentNotice.title}
                    className="w-full object-contain"
                  />
                </div>
              )}
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                {currentNotice.content}
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default NoticeDetailPage;
