/**
 * @role: pages — 어드민 스케줄러 관리 페이지
 * @rule: 레이아웃·탭 조합만 담당, 비즈니스 로직 포함 금지
 */
import { useEffect, useState } from 'react';
import { getDashboardSummaryApi, DashboardScheduler } from '@/features/Admin/Scheduler/api/schedulerAdminApi';
import { useSchedulerJobs } from '@/features/Admin/Scheduler/hooks/useSchedulerJobs';
import { useSchedulerRuns, RunFilter } from '@/features/Admin/Scheduler/hooks/useSchedulerRuns';
import JobListTab from '@/features/Admin/Scheduler/ui/JobListTab';
import RunLogsTab from '@/features/Admin/Scheduler/ui/RunLogsTab';

type Tab = 'jobs' | 'runs';

const AdminSchedulerPage = () => {
  const [tab, setTab] = useState<Tab>('jobs');
  const [filter, setFilter] = useState<RunFilter>({ limit: 50 });
  const [dashboardScheduler, setDashboardScheduler] = useState<DashboardScheduler | null>(null);

  const { jobs, isLoading: jobsLoading, refetch: refetchJobs } = useSchedulerJobs();
  const { runs, isLoading: runsLoading, cancel, retry, refetch: refetchRuns } = useSchedulerRuns(filter);

  useEffect(() => {
    getDashboardSummaryApi()
      .then((data) => setDashboardScheduler(data.scheduler))
      .catch(() => {});
  }, []);

  const hasWarning =
    (dashboardScheduler?.failures24h ?? 0) > 0 ||
    (dashboardScheduler?.staleJobs?.length ?? 0) > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">스케줄러</h1>
            <p className="mt-0.5 text-sm text-gray-400">잡 실행 현황 및 로그 관리</p>
          </div>
          <button
            onClick={() => { refetchJobs(); refetchRuns(); }}
            className="flex items-center gap-1.5 rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            새로고침
          </button>
        </div>

        {/* 대시보드 경고 배너 */}
        {hasWarning && (
          <div className="mb-5 flex flex-wrap items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            {(dashboardScheduler?.failures24h ?? 0) > 0 && (
              <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                24시간 실패 {dashboardScheduler!.failures24h}건
              </span>
            )}
            {(dashboardScheduler?.staleJobs?.length ?? 0) > 0 && (
              <span className="text-xs text-amber-700">
                오래된 잡: {dashboardScheduler!.staleJobs.join(', ')}
              </span>
            )}
          </div>
        )}

        {/* 탭 */}
        <div className="mb-5 flex gap-1 border-b border-gray-200">
          {([['jobs', '작업 목록'], ['runs', '실행 로그']] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === key
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 탭 컨텐츠 */}
        {tab === 'jobs' && (
          <JobListTab
            jobs={jobs}
            isLoading={jobsLoading}
            onRefresh={refetchJobs}
          />
        )}
        {tab === 'runs' && (
          <RunLogsTab
            runs={runs}
            isLoading={runsLoading}
            filter={filter}
            onFilterChange={setFilter}
            onCancel={cancel}
            onRetry={retry}
          />
        )}
      </div>
    </div>
  );
};

export default AdminSchedulerPage;
