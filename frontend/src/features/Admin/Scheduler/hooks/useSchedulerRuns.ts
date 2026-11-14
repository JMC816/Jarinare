/**
 * @role: features/hooks — 스케줄러 실행 로그 조회·취소·재실행
 * @rule: api/ 호출만 담당
 */
import { useEffect, useState } from 'react';
import {
  cancelRunApi,
  getSchedulerRunsApi,
  retryRunApi,
  RunLog,
} from '../api/schedulerAdminApi';

export interface RunFilter {
  status?: string;
  jobName?: string;
  limit?: number;
}

export const useSchedulerRuns = (filter: RunFilter) => {
  const [runs, setRuns] = useState<RunLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = async () => {
    setIsLoading(true);
    try {
      const data = await getSchedulerRunsApi({
        limit: filter.limit ?? 50,
        status: filter.status || undefined,
        jobName: filter.jobName || undefined,
      });
      setRuns(data);
    } catch (e) {
      console.error('[useSchedulerRuns]', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [filter.status, filter.jobName, filter.limit]);

  const cancel = async (runId: string) => {
    await cancelRunApi(runId);
    await fetch();
  };

  const retry = async (runId: string) => {
    await retryRunApi(runId);
    await fetch();
  };

  return { runs, isLoading, refetch: fetch, cancel, retry };
};
