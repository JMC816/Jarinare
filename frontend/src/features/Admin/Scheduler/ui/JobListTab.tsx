/**
 * @role: features/ui — 스케줄러 작업 목록 탭
 * @rule: UI 렌더링만 담당
 */
import { useState } from 'react';
import { JobInfo, runJobApi, updateJobSettingApi } from '../api/schedulerAdminApi';
import RunJobModal from './RunJobModal';

interface Props {
  jobs: JobInfo[];
  isLoading: boolean;
  onRefresh: () => void;
}

const STATUS_COLOR: Record<string, string> = {
  SUCCESS: 'text-green-600 bg-green-50',
  FAILED: 'text-red-600 bg-red-50',
  RUNNING: 'text-blue-600 bg-blue-50',
  PENDING: 'text-yellow-600 bg-yellow-50',
  CANCELLED: 'text-gray-500 bg-gray-100',
};

const STATUS_LABEL: Record<string, string> = {
  SUCCESS: '성공',
  FAILED: '실패',
  RUNNING: '실행 중',
  PENDING: '대기',
  CANCELLED: '취소',
};

const formatDuration = (ms: number | null) => {
  if (ms === null) return '-';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

const formatDate = (iso: string | null) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const JobListTab = ({ jobs, isLoading, onRefresh }: Props) => {
  const [runningJob, setRunningJob] = useState<string | null>(null);
  const [modalJob, setModalJob] = useState<string | null>(null);
  const [togglingJob, setTogglingJob] = useState<string | null>(null);

  const handleRunClick = (jobName: string) => {
    setModalJob(jobName);
  };

  const handleRunConfirm = async (params: { startDate?: string; endDate?: string }) => {
    if (!modalJob) return;
    setRunningJob(modalJob);
    setModalJob(null);
    try {
      await runJobApi(modalJob, params);
      onRefresh();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? '실행 실패';
      alert(msg);
    } finally {
      setRunningJob(null);
    }
  };

  const handleToggle = async (job: JobInfo) => {
    setTogglingJob(job.name);
    try {
      await updateJobSettingApi(job.name, !job.isActive);
      onRefresh();
    } catch {
      alert('설정 변경 실패');
    } finally {
      setTogglingJob(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-gray-400">
        불러오는 중...
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500">
              <th className="px-4 py-3 text-left">작업명</th>
              <th className="px-4 py-3 text-left">주기</th>
              <th className="px-4 py-3 text-left">다음 실행</th>
              <th className="px-4 py-3 text-left">마지막 결과</th>
              <th className="px-4 py-3 text-left">소요시간</th>
              <th className="px-4 py-3 text-center">활성</th>
              <th className="px-4 py-3 text-center">실행</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => {
              const isRunning =
                job.lastStatus === 'RUNNING' || job.lastStatus === 'PENDING';
              const isCurrentlyRunning = runningJob === job.name;

              return (
                <tr
                  key={job.name}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{job.name}</div>
                    <div className="text-xs text-gray-400">{job.description}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {job.cron}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {formatDate(job.nextRunAt)}
                  </td>
                  <td className="px-4 py-3">
                    {job.lastStatus ? (
                      <span
                        className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[job.lastStatus] ?? 'text-gray-500 bg-gray-100'}`}
                      >
                        {STATUS_LABEL[job.lastStatus] ?? job.lastStatus}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">미실행</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {formatDuration(job.lastDurationMs)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggle(job)}
                      disabled={togglingJob === job.name}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        job.isActive ? 'bg-blue-600' : 'bg-gray-200'
                      } disabled:opacity-50`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                          job.isActive ? 'translate-x-4' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleRunClick(job.name)}
                      disabled={isRunning || isCurrentlyRunning}
                      className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isRunning ? '실행 중' : '지금 실행'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modalJob && (
        <RunJobModal
          jobName={modalJob}
          onConfirm={handleRunConfirm}
          onClose={() => setModalJob(null)}
        />
      )}
    </>
  );
};

export default JobListTab;
