import { IsAcceptRepsonseProps } from '../types/isAcceptResponseType';
import { elapsedTime } from '@/shared/lib/formatDate';

export const RefuseResponse = ({
  responseTime,
  responseContant,
  isRead,
  onClick,
  responseTitle,
}: IsAcceptRepsonseProps) => {
  return (
    <div
      onClick={onClick}
      className={`mx-4 my-2 rounded-2xl px-4 py-3 shadow-sm ${isRead ? 'bg-gray-100' : 'bg-white'}`}
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="rounded-full bg-red/10 px-2 py-0.5 text-xs font-bold text-red">
          좌석 변경
        </span>
        <span className="text-xs text-darkGray">
          {elapsedTime(Number(responseTime))}
        </span>
      </div>
      <p className="text-tiny font-bold text-gray-800">
        {responseContant?.map((item) => item.seatId).join(' • ')} 자리에서
        변경이 <span className="text-red">{responseTitle}&nbsp;</span>
        되었습니다.
      </p>
    </div>
  );
};
