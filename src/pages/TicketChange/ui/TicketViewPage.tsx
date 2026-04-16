type TicketData = {
  start: string;
  end: string;
  st: number;
  et: number;
  day: string;
  type: string;
  car: string;
  seats: string[];
  adult: number;
  kid: number;
  pay: number;
};

const TicketViewPage = () => {
  const hash = window.location.hash.slice(1);
  if (!hash)
    return (
      <div className="p-8 text-center text-gray-400">잘못된 접근입니다.</div>
    );

  let d: TicketData;
  try {
    const normalized = hash.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      '=',
    );
    const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
    d = JSON.parse(new TextDecoder().decode(bytes)) as TicketData;
  } catch {
    return (
      <div className="p-8 text-center text-gray-400">잘못된 접근입니다.</div>
    );
  }

  const startHH = String(d.st).substring(8, 10);
  const startMM = String(d.st).substring(10, 12);
  const endHH = String(d.et).substring(8, 10);
  const endMM = String(d.et).substring(10, 12);
  let dur =
    Number(endHH) * 60 +
    Number(endMM) -
    (Number(startHH) * 60 + Number(startMM));
  if (dur < 0) dur += 24 * 60;
  const durText =
    dur >= 60
      ? `${Math.floor(dur / 60)}시간 ${dur % 60 > 0 ? `${dur % 60}분` : ''}`
      : `${dur}분`;

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-gray-100 px-6 py-10">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl shadow-xl">
        {/* 상단: 파란 헤더 */}
        <div className="bg-blue px-5 pb-6 pt-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold text-white">
              {d.type}
            </span>
            <span className="text-xs text-white/80">{d.day}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-2xl font-black text-white">{d.start}</span>
              <span className="text-sm font-semibold text-white/80">
                {startHH}:{startMM}
              </span>
            </div>
            <div className="flex flex-1 flex-col items-center gap-0.5">
              <div className="flex w-full items-center">
                <div className="h-0 flex-1 border-t border-dashed border-white/50" />
                <span className="mx-1 inline-block -scale-x-100 text-lg leading-none">
                  🚄
                </span>
                <div className="h-0 flex-1 border-t border-dashed border-white/50" />
              </div>
              <span className="text-[10px] text-white/70">{durText}</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-2xl font-black text-white">{d.end}</span>
              <span className="text-sm font-semibold text-white/80">
                {endHH}:{endMM}
              </span>
            </div>
          </div>
        </div>

        {/* 절취선 */}
        <div className="flex items-center bg-white py-3">
          <div className="mx-5 flex-1 border-t-2 border-dashed border-gray-300" />
        </div>

        {/* 중단: 상세 정보 */}
        <div className="bg-white px-5 pb-4">
          <div className="flex flex-col gap-3">
            <Row
              label="호차 / 좌석"
              value={`${d.car}호차  ${d.seats.join(', ')}`}
            />
            <Row label="인원" value={`어른 ${d.adult}명 · 어린이 ${d.kid}명`} />
            <Row
              label="요금"
              value={`${d.pay.toLocaleString('ko-KR')}원`}
              bold
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Row = ({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-gray-400">{label}</span>
    <span
      className={`text-sm ${bold ? 'font-bold text-blue' : 'font-semibold text-gray-800'}`}
    >
      {value}
    </span>
  </div>
);

export default TicketViewPage;
