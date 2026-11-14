/**
 * @role: features/ui — 스케줄러 실행 로그 탭
 * @rule: UI 렌더링만 담당
 */
import { useState } from 'react';
import { RunLog } from '../api/schedulerAdminApi';
import { RunFilter } from '../hooks/useSchedulerRuns';

const JOB_NAMES = [
  'station-sync',
  'train-time-sync',
  'notification-rotate',
  'notification-drop',
  'seat-change-expire',
  'seat-hold-expire',
];

const STATUSES = [
  { value: '', label: '전체' },
  { value: 'PENDING', label: '대기' },
  { value: 'RUNNING', label: '실행 중' },
  { value: 'SUCCESS', label: '성공' },
  { value: 'FAILED', label: '실패' },
  { value: 'CANCELLED', label: '취소' },
];

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

const formatDate = (iso: string | null) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const getDurationMs = (run: RunLog) => {
  if (!run.startedAt || !run.endedAt) return null;
  return new Date(run.endedAt).getTime() - new Date(run.startedAt).getTime();
};

const formatDuration = (ms: number | null) => {
  if (ms === null) return '-';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

interface Props {
  runs: RunLog[];
  isLoading: boolean;
  filter: RunFilter;
  onFilterChange: (f: RunFilter) => void;
  onCancel: (runId: string) => Promise<void>;
  onRetry: (runId: string) => Promise<void>;
}

const RunLogsTab = ({ runs, isLoading, filter, onFilterChange, onCancel, onRetry }: Props) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleCancel = async (runId: string) => {
    setActionLoading(runId);
    try {
      await onCancel(runId);
    } catch {
      alert('취소 실패');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRetry = async (runId: string) => {
    setActionLoading(runId);
    try {
      await onRetry(runId);
    } catch {
      alert('재실행 실패');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 필터 */}
      <div className="flex items-center gap-3">
        <select
          value={filter.status ?? ''}
          onChange={(e) => onFilterChange({ ...filter, status: e.target.value })}
          className="rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <select
          value={filter.jobName ?? ''}
          onChange={(e) => onFilterChange({ ...filter, jobName: e.target.value })}
          className="rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500"
        >
          <option value="">전체 작업</option>
          {JOB_NAMES.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>

        <select
          value={filter.limit ?? 50}
          onChange={(e) => onFilterChange({ ...filter, limit: Number(e.target.value) })}
          className="rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500"
        >
          <option value={20}>20건</option>
          <option value={50}>50건</option>
          <option value={100}>100건</option>
        </select>
      </div>

      {/* 테이블 */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-400">
            불러오는 중...
          </div>
        ) : runs.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-400">
            실행 로그가 없습니다.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500">
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">작업</th>
                <th className="px-4 py-3 text-left">상태</th>
                <th className="px-4 py-3 text-left">기간</th>
                <th className="px-4 py-3 text-left">시작</th>
                <th className="px-4 py-3 text-left">소요</th>
                <th className="px-4 py-3 text-center">액션</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <>
                  <tr
                    key={run.runId}
                    className="cursor-pointer border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
                    onClick={() => setExpandedId(expandedId === run.runId ? null : run.runId)}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">
                      #{run.runId}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{run.jobName}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[run.status] ?? 'text-gray-500 bg-gray-100'}`}
                      >
                        {STATUS_LABEL[run.status] ?? run.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {run.startYmd === run.endYmd
                        ? run.startYmd
                        : `${run.startYmd}~${run.endYmd}`}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {formatDate(run.startedAt)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {formatDuration(getDurationMs(run))}
                    </td>
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      {run.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancel(run.runId)}
                          disabled={actionLoading === run.runId}
                          className="rounded border border-gray-300 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                        >
                          취소
                        </button>
                      )}
                      {(run.status === 'FAILED' || run.status === 'CANCELLED') && (
                        <button
                          onClick={() => handleRetry(run.runId)}
                          disabled={actionLoading === run.runId}
                          className="rounded bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-40"
                        >
                          재실행
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedId === run.runId && (
                    <tr key={`${run.runId}-detail`} className="bg-gray-50">
                      <td colSpan={7} className="px-6 py-3">
                        <div className="flex flex-col gap-1 text-xs text-gray-600">
                          {run.errorMessage && (
                            <div className="flex gap-2">
                              <span className="font-medium text-red-500">오류:</span>
                              <span className="text-red-600">{run.errorMessage}</span>
                            </div>
                          )}
                          {run.metadata !== null && run.metadata !== undefined && (
                            <div className="flex gap-2">
                              <span className="font-medium">결과:</span>
                              <span className="font-mono">
                                {JSON.stringify(run.metadata)}
                              </span>
                            </div>
                          )}
                          {run.triggeredBy && (
                            <div className="flex gap-2">
                              <span className="font-medium">실행자:</span>
                              <span>어드민 #{run.triggeredBy}</span>
                            </div>
                          )}
                          {!run.errorMessage && !run.metadata && !run.triggeredBy && (
                            <span className="text-gray-400">상세 정보 없음</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RunLogsTab;
