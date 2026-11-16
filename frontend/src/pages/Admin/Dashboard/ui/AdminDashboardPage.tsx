/**
 * @role: pages — 어드민 대시보드
 * @rule: 레이아웃·데이터 조합만 담당, 비즈니스 로직 포함 금지
 */
import { Link, useLocation, useNavigate } from 'react-router-dom';
import tapIcon from '@/assets/logo/tap.png';
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useCurrentUser } from '@/features/Auth/hooks/useCurrentUser';
import { useDashboard } from '@/features/Admin/Dashboard/hooks/useDashboard';

const NAV_ITEMS = [
  { label: '대시보드',    path: '/admin/dashboard' },
  { label: '회원',        path: '/admin/users' },
  { label: '신고',        path: '/admin/reports' },
  { label: '예매·좌석',   path: '/admin/reservations' },
  { label: '게시판',      path: '/admin/board' },
  { label: '멤버십',      path: '/admin/membership' },
  { label: '카드 할인',   path: '/admin/card-discount' },
  { label: '알림 발송',   path: '/admin/notifications' },
  { label: '스케줄러',    path: '/admin/scheduler' },
  { label: '감사 로그',   path: '/admin/audit' },
  { label: '역할·어드민', path: '/admin/roles' },
];

const EMPTY_HOURLY = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0, revenue: 0 }));

const AdminDashboardPage = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const { summary, hourly, isLoading, lastUpdated, period, changePeriod, refetch } = useDashboard();

  const kstHour = new Date(Date.now() + 9 * 60 * 60 * 1000).getUTCHours();
  const hourlyData = hourly?.hourly ?? EMPTY_HOURLY;
  const maxRouteCount = summary?.popularRoutes?.[0]?.count || 1;
  const maxDestCount  = summary?.popularDestinations?.[0]?.count || 1;

  const lastUpdatedStr = lastUpdated
    ? lastUpdated.toLocaleString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    : '-';

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">

      {/* ── 헤더 (PCTopNav 동일 구조) ── */}
      <header className="sticky top-0 z-50 h-14 w-full shrink-0 border-b border-gray-200/50 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="flex h-full items-center justify-between px-6">
          <div className="flex items-center gap-2">
              <img src={tapIcon} alt="" width={34} height={34} />
              <span className="text-base font-black text-gray-900">자리나래 관리자</span>
            </div>

          <div className="flex items-center gap-2">
            {/* 사용자 정보 */}
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#9ca3af">
                  <path d="M12 12c2.7 0 5-2.3 5-5S14.7 2 12 2 7 4.3 7 7s2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v2h20v-2c0-3.3-6.7-5-10-5z" />
                </svg>
              </div>
              <div className="text-xs">
                <div className="font-semibold text-gray-800">{user?.name ?? '-'}</div>
                <div className="text-[10px] text-gray-400">{user?.adminRole?.name ?? '-'}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── 본문 ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── 사이드바 (PCSidebar 동일 구조) ── */}
        <aside className="flex h-full w-[220px] shrink-0 flex-col overflow-y-auto border-r border-gray-200/50 bg-white/60 px-3 py-6 backdrop-blur-xl">
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ label, path }) => {
              const active = pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                    active ? 'bg-lightBlue text-blue' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <span className={`h-4 w-4 shrink-0 ${active ? 'bg-blue' : 'bg-gray-200'}`} style={{ borderRadius: 3 }} />
                  <span className="text-sm font-semibold">{label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* ── 콘텐츠 ── */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* 타이틀 + 컨트롤 버튼 */}
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-gray-900">대시보드</h1>
              <p className="mt-0.5 text-tiny text-gray-400">{lastUpdatedStr} 기준</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-sm bg-gray-100 p-1">
                {(['today', 'week'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => changePeriod(p)}
                    className={`rounded-sm px-4 py-1.5 text-sm font-bold transition-colors ${
                      period === p ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {p === 'today' ? '오늘' : '이번 주'}
                  </button>
                ))}
              </div>
              <button
                onClick={refetch}
                className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                새로고침
              </button>
              <Link to="/" className="rounded-md border border-lightBlue bg-lightBlue px-4 py-2 text-sm font-bold text-blue hover:bg-lightBlue/80">
                서비스로 이동
              </Link>
            </div>
          </div>

          {/* 처리할 일 */}
          <section className="mb-5">
            <h2 className="mb-3 text-base font-bold text-gray-700">처리할 일</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/admin/reports')}
                className="flex items-center justify-between rounded-xl bg-white px-5 py-4 text-left shadow-sm transition-shadow hover:shadow-md"
              >
                <div>
                  <p className="text-tiny text-gray-500">미처리 신고</p>
                  <p className="mt-1 text-3xl font-black text-blue">
                    {isLoading ? '-' : (summary?.pendingReports ?? 0)}
                    <span className="ml-0.5 text-3xl text-blue">건</span>
                  </p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </button>

              <button
                onClick={() => navigate('/admin/scheduler')}
                className="flex items-center justify-between rounded-xl bg-white px-5 py-4 text-left shadow-sm transition-shadow hover:shadow-md"
              >
                <div>
                  <p className="text-tiny text-gray-500">스케줄러 실패 · 최근 24시간</p>
                  <div className="mt-1 flex items-baseline gap-3">
                    <p className="text-3xl font-black text-red">
                      {isLoading ? '-' : (summary?.scheduler.failures24h ?? 0)}
                      <span className="ml-0.5 text-3xl text-red">건</span>
                    </p>
                    {(summary?.scheduler.staleJobs?.length ?? 0) > 0 && (
                      <p className="text-tiny text-gray-400">
                        오래된 작업 {summary!.scheduler.staleJobs.length}개
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </button>
            </div>
          </section>

          {/* 오늘의 숫자 */}
          <section className="mb-5">
            <h2 className="mb-3 text-base font-bold text-gray-700">오늘의 숫자</h2>
            <div className="grid grid-cols-5 gap-4">
              {[
                { label: '예매 수',     value: `${summary?.reservations.count ?? 0}건` },
                { label: '매출',        value: `${(summary?.reservations.revenue ?? 0).toLocaleString('ko-KR')}원` },
                { label: '취소율',      value: `${summary?.reservations.cancelRate ?? 0}%` },
                { label: '신규 가입',   value: `${summary?.users.newCount ?? 0}명` },
                { label: '활성 사용자', value: `${summary?.users.activeCount ?? 0}명` },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl bg-white px-4 py-4 shadow-sm">
                  <p className="text-tiny text-gray-500">{label}</p>
                  <p className="mt-2 text-xl font-black text-gray-900">{isLoading ? '-' : value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 추이 */}
          <section className="mb-5">
            <h2 className="mb-3 text-base font-bold text-gray-700">추이</h2>
            <div className="grid grid-cols-3 gap-4">
              {/* 시간대별 예매 차트 */}
              <div className="col-span-2 rounded-xl bg-white px-5 py-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-base font-semibold text-gray-700">시간대별 예매</p>
                  <span className="text-tiny text-gray-500">0시 ~ 23시</span>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={hourlyData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                    <XAxis
                      dataKey="hour"
                      ticks={[0, 6, 12, 18, 23]}
                      tickFormatter={(h: number) => `${h}시`}
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip
                      formatter={(value) => [`${value}건`, '예매 수']}
                      labelFormatter={(label) => `${label}시`}
                      contentStyle={{ fontSize: 12 }}
                    />
                    <Bar dataKey="count" radius={[2, 2, 0, 0]} maxBarSize={22}>
                      {hourlyData.map((entry) => (
                        <Cell
                          key={`cell-${entry.hour}`}
                          fill={entry.hour === kstHour ? '#0062FF' : '#E7F2FD'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* 좌석 변경 요청 */}
              <div className="rounded-xl bg-white px-5 py-4 shadow-sm">
                <p className="mb-4 text-base font-semibold text-gray-700">좌석 변경 요청</p>
                <div>
                  <p className="text-tiny text-gray-500">요청 수</p>
                  <p className="mt-1 text-2xl font-black text-gray-900">
                    {isLoading ? '-' : (summary?.seatChanges.total ?? 0)}
                    <span className="ml-0.5 text-sm">건</span>
                  </p>
                </div>
                <div className="mt-5">
                  <p className="text-tiny text-gray-500">수락률</p>
                  <p className="mt-1 text-2xl font-black text-blue">
                    {isLoading ? '-' : (summary?.seatChanges.acceptRate ?? 0)}
                    <span className="ml-0.5 text-sm">%</span>
                  </p>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-blue transition-all duration-500"
                      style={{ width: `${summary?.seatChanges.acceptRate ?? 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 순위 */}
          <section>
            <h2 className="mb-3 text-base font-bold text-gray-700">순위</h2>
            <div className="grid grid-cols-2 gap-4">
              {/* 인기 노선 TOP 5 */}
              <div className="rounded-xl bg-white px-5 py-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-base font-semibold text-gray-700">인기 노선 TOP 5</p>
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-500">
                    API 추가 예정
                  </span>
                </div>
                {(summary?.popularRoutes?.length ?? 0) === 0 ? (
                  <p className="text-sm text-gray-300">데이터 없음</p>
                ) : (
                  <div className="flex flex-col gap-5">
                    {summary!.popularRoutes.map((r, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-4 shrink-0 text-base font-bold text-gray-400">{i + 1}</span>
                        <span className="w-32 shrink-0 truncate text-base text-gray-700">{r.dep} → {r.arr}</span>
                        <div className="flex-1 overflow-hidden rounded-full bg-gray-100" style={{ height: 8 }}>
                          <div
                            className="h-full rounded-full bg-blue"
                            style={{ width: `${(r.count / maxRouteCount) * 100}%` }}
                          />
                        </div>
                        <span className="w-10 shrink-0 text-right text-base text-gray-500">{r.count}건</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 인기 목적지 TOP 5 */}
              <div className="rounded-xl bg-white px-5 py-4 shadow-sm">
                <p className="mb-4 text-base font-semibold text-gray-700">인기 목적지 TOP 5</p>
                {(summary?.popularDestinations?.length ?? 0) === 0 ? (
                  <p className="text-sm text-gray-300">데이터 없음</p>
                ) : (
                  <div className="flex flex-col gap-5">
                    {summary!.popularDestinations.map((d, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className={`w-4 shrink-0 text-base font-bold ${i === 0 ? 'text-blue' : 'text-gray-900'}`}>{i + 1}</span>
                        <span className="w-16 shrink-0 truncate text-base text-gray-700">{d.destination}</span>
                        <div className="flex-1 overflow-hidden rounded-full bg-gray-100" style={{ height: 8 }}>
                          <div
                            className={`h-full rounded-full ${i === 0 ? 'bg-blue' : 'bg-lightBlueImpossible'}`}
                            style={{ width: `${(d.count / maxDestCount) * 100}%` }}
                          />
                        </div>
                        <span className="w-10 shrink-0 text-right text-base font-bold text-gray-900">{d.count}건</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
