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

const fmt = (time: number, start: number, len: number) =>
  String(time).substring(start, start + len);

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

  const startHH = fmt(d.st, 8, 2);
  const startMM = fmt(d.st, 10, 2);
  const endHH = fmt(d.et, 8, 2);
  const endMM = fmt(d.et, 10, 2);
  const dh = Number(startHH);
  const dm = Number(startMM);
  const ah = Number(endHH);
  const am = Number(endMM);
  let dur = ah * 60 + am - (dh * 60 + dm);
  if (dur < 0) dur += 24 * 60;
  const durText =
    dur >= 60
      ? `${Math.floor(dur / 60)}시간 ${dur % 60 > 0 ? `${dur % 60}분` : ''}`
      : `${dur}분`;

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-gray-100 p-6">
      <div className="mt-8 w-full max-w-sm overflow-hidden rounded-2xl bg-white px-5 py-5 shadow-sm">
        {/* 노선 헤더 */}
        <div className="mb-4 flex w-full items-center justify-between text-base font-bold text-gray-900">
          <span>{d.start}</span>
          <div className="flex flex-1 flex-col items-center gap-1 px-3">
            <div className="flex w-full items-center">
              <div className="flex-1 border-t-2 border-dashed border-gray-300" />
              <span className="mx-2 inline-block -scale-x-100 text-xl">🚄</span>
              <div className="flex-1 border-t-2 border-dashed border-gray-300" />
            </div>
            <span className="text-[10px] font-normal text-gray-400">
              {durText}
            </span>
          </div>
          <span>{d.end}</span>
        </div>

        {/* 티켓 정보 */}
        <div className="flex w-full flex-col gap-y-4">
          <Row
            label="시간"
            value={`${startHH}:${startMM} - ${endHH}:${endMM}`}
            blue
          />
          <Row label="출발" value={d.day} blue />
          <Row label="기차" value={d.type} />
          <Row label="호차" value={`${d.car}호차 ${d.seats.join(', ')}`} />
          <Row label="인원" value={`어른 ${d.adult}명 • 어린이 ${d.kid}명`} />
          <div className="w-full border border-gray-100" />
          <Row label="요금" value={`${d.pay.toLocaleString('ko-KR')}원`} />
        </div>
      </div>
    </div>
  );
};

const Row = ({
  label,
  value,
  blue,
}: {
  label: string;
  value: string;
  blue?: boolean;
}) => (
  <div className="flex justify-between text-sm font-bold">
    <span className="text-gray-400">{label}</span>
    <span className={blue ? 'text-blue' : 'text-black'}>{value}</span>
  </div>
);

export default TicketViewPage;
