/**
 * @role: pages — 어드민 접근 권한 없음
 * @rule: 레이아웃만 담당
 */
import { Link } from 'react-router-dom';
import { backendClient, ACCESS_TOKEN_KEY } from '@/shared/api/backendClient';
import { useCurrentUser } from '@/features/Auth/hooks/useCurrentUser';

const AdminAccessDeniedPage = () => {
  const { user } = useCurrentUser();

  const handleSwitchAccount = async () => {
    await backendClient.post('/oauth/logout').catch(() => {});
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.location.href = '/admin/login';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-[420px] rounded-2xl bg-white px-12 py-10 shadow-sm">
        {/* 아이콘 */}
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-lightBlue">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0062FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        {/* 타이틀 */}
        <h1 className="text-2xl font-black leading-tight text-gray-900">
          접근 권한이
          <br />
          없어요
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          이 계정에는 관리자 역할이 없어요. 권한이 필요하면 최고 관리자에게 요청해 주세요.
        </p>

        {/* 로그인한 계정 카드 */}
        <div className="mt-7 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
          <p className="mb-1 text-xs font-medium text-gray-400">로그인한 계정</p>
          <p className="text-sm text-gray-700">{user?.email ?? '-'}</p>
        </div>

        {/* 버튼 */}
        <div className="mt-5 flex flex-col gap-2">
          <Link
            to="/"
            className="block w-full rounded-lg bg-blue py-3.5 text-center text-base font-bold text-white transition-opacity hover:opacity-90"
          >
            서비스로 돌아가기
          </Link>
          <button
            onClick={handleSwitchAccount}
            className="w-full rounded-lg bg-lightBlue py-3.5 text-base font-bold text-blue transition-opacity hover:opacity-80"
          >
            다른 계정으로 로그인
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAccessDeniedPage;
