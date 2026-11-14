/**
 * @role: features/ui — train-time-sync 기간 선택 모달
 * @rule: UI + 로컬 상태만 담당
 */
import { useState } from 'react';

interface Props {
  jobName: string;
  onConfirm: (params: { startDate?: string; endDate?: string }) => void;
  onClose: () => void;
}

const RunJobModal = ({ jobName, onConfirm, onClose }: Props) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const needsPeriod = jobName === 'train-time-sync';

  const handleConfirm = () => {
    if (needsPeriod) {
      onConfirm({ startDate: startDate || undefined, endDate: endDate || undefined });
    } else {
      onConfirm({});
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[400px] rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-base font-bold text-gray-900">
          {jobName} 실행
        </h2>

        {needsPeriod && (
          <div className="mb-5 flex flex-col gap-3">
            <p className="text-sm text-gray-500">기간 미입력 시 오늘부터 7일</p>
            <div className="flex items-center gap-3">
              <div className="flex flex-1 flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">시작일</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <span className="mt-5 text-gray-400">~</span>
              <div className="flex flex-1 flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">종료일</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {!needsPeriod && (
          <p className="mb-5 text-sm text-gray-500">지금 바로 실행할까요?</p>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded px-4 py-2 text-sm text-gray-500 hover:bg-gray-100"
          >
            취소
          </button>
          <button
            onClick={() => handleConfirm()}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            실행
          </button>
        </div>
      </div>
    </div>
  );
};

export default RunJobModal;
