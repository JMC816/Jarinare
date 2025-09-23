import { IsAcceptRepsonseProps } from '../types/isAcceptResponseType';

export const RefuseResponse = ({
  responseTitle,
  responseTime,
  responseContant,
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
    <div className="flex h-[80px] flex-col bg-lightBlue p-[10px] active:bg-blue/20">
      <div className="flex justify-between text-tiny text-darkGray">
        <span>좌석 변경</span>
        <span>{elapsedTime()}</span>
      </div>
      <span className="mt-1 text-tiny font-bold">
        {responseContant?.map((item) => item.seatId).join(' • ')} 자리에서
        변경이 <span className="text-red">{responseTitle}&nbsp;</span>
        되었습니다.
      </span>
    </div>
  );
};
