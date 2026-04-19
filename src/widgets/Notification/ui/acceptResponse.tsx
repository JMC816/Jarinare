import { IsAcceptRepsonseProps } from '../types/isAcceptResponseType';

export const AcceptResponse = ({
  responseTitle,
  responseTime,
  responseContant,
  isRead,
  onClick,
}: IsAcceptRepsonseProps) => {
  const elapsedTime = () => {
    const requestTime = new Date(responseTime ? Number(responseTime) : 0);
    const nowTime = new Date();

    const diff = (nowTime.getTime() - requestTime.getTime()) / 1000;

    const times = [
      { name: '년', milliSeconds: 60 * 60 * 24 * 365 },
      { name: '개월', milliSeconds: 60 * 60 * 24 * 30 },
      { name: '일', milliSeconds: 60 * 60 * 24 },
      { name: '시간', milliSeconds: 60 * 60 },
      { name: '분', milliSeconds: 60 },
    ];

    for (const value of times) {
      const betweenTime = Math.floor(diff / value.milliSeconds);

      if (betweenTime > 0) {
        return `${betweenTime}${value.name} 전`;
      }
    }
    return '방금 전';
  };

  return (
    <div
      onClick={onClick}
      className={`mx-4 my-2 rounded-2xl px-4 py-3 shadow-sm ${isRead ? 'bg-gray-100' : 'bg-white'}`}
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="rounded-full bg-green/10 px-2 py-0.5 text-xs font-bold text-green">
          좌석 변경
        </span>
        <span className="text-xs text-darkGray">{elapsedTime()}</span>
      </div>
      <p className="text-tiny font-bold text-gray-800">
        {responseContant?.map((item) => item.seatId).join(' • ')} 자리에서
        변경이 <span className="text-green">{responseTitle}&nbsp;</span>
        되었습니다.
      </p>
    </div>
  );
};
