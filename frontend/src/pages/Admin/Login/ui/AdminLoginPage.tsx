/**
 * @role: pages — 어드민 로그인
 * @rule: 레이아웃만 담당, 로그인 로직은 useAdminLogin 에 위임
 */
import { Link } from 'react-router-dom';
import tapIcon from '@/assets/logo/tap.png';
import { useAdminLogin } from '@/features/Admin/Login/hooks/useAdminLogin';

const AdminLoginPage = () => {
  const { email, setEmail, password, setPassword, errorMsg, isLoading, handleSubmit } = useAdminLogin();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-100">
      <div className="w-[420px] rounded-2xl bg-white px-12 py-10 shadow-sm">
        {/* 탭 아이콘 */}
        <img src={tapIcon} alt="자리나래" width={56} height={56} className="mb-5" />

        {/* 타이틀 */}
        <h1 className="text-2xl font-black leading-tight text-gray-900">
          자리나래 관리자
          <br />
          로그인
        </h1>
        <p className="mt-2 text-sm text-gray-400">관리자 계정으로 로그인해 주세요.</p>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600">이메일</label>
            <input
              type="email"
              required
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-100 bg-gray-50 px-4 py-3.5 text-sm text-gray-800 outline-none placeholder:text-gray-300 focus:border-blue focus:ring-2 focus:ring-lightBlue"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600">비밀번호</label>
            <input
              type="password"
              required
              placeholder="비밀번호를 입력해 주세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-100 bg-gray-50 px-4 py-3.5 text-sm text-gray-800 outline-none placeholder:text-gray-300 focus:border-blue focus:ring-2 focus:ring-lightBlue"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-red">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-1 w-full rounded-lg bg-blue py-3.5 text-base font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>

      {/* 하단 링크 */}
      <Link
        to="/"
        className="text-sm font-medium text-gray-500 underline-offset-2 hover:underline"
      >
        서비스로 돌아가기
      </Link>
    </div>
  );
};

export default AdminLoginPage;
