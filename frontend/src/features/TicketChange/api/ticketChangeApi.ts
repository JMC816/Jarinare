/**
 * @role: features/api
 * @rule: 좌석 변경 요청 백엔드 API 호출만 담당
 */
import { backendClient } from '@/shared/api/backendClient';

export interface ChangeRequestResult {
  status: 'MOVED' | 'PENDING';
}

export const createChangeRequest = async (
  reservationIds: number[],
  toCarNo: number,
  toSeatIds: string[],
): Promise<ChangeRequestResult> => {
  const { data } = await backendClient.post<ChangeRequestResult>(
    '/api/seats/change-requests',
    { reservationIds, toCarNo, toSeatIds },
  );
  return data;
};
