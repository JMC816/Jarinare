import { useNaviation } from '../hooks/TicketChangeHook';
import { useTicketLocation } from '../hooks/useTicketLocation';
import { SeatType } from '@/entities/Seat/types/seatType';
import { useReset } from '../hooks/useReset';
import BackWardPageButton from '@/widgets/layouts/ui/BackWardPageButton';
import { memo, useMemo } from 'react';
import QRCode from 'react-qr-code';

const TicketSeatChangePage = memo(() => {
  const { navigate } = useNaviation();
  const { location } = useTicketLocation();
  const seats: SeatType[] = location.state.groups;

  const filtred = useMemo(() => {
    return seats?.map((id) => id.seatId);
  }, [seats]);

  const qrValue = useMemo(() => {
    if (!seats?.[0]) return '';
    const s = seats[0];
    const payload = JSON.stringify({
      start: s.startStationForView,
      end: s.endStationForView,
      st: s.startTime,
      et: s.endTime,
      day: s.startDayForView,
      type: s.trainType,
      car: s.trainNoId,
      seats: filtred,
      adult: s.selectAdult,
      kid: s.selectKid,
      pay: s.selectPay,
    });
    const bytes = new TextEncoder().encode(payload);
    const b64 = btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(''))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return `${window.location.origin}/ticket/view#${b64}`;
  }, [seats, filtred]);

  useReset();

  if (!seats) return;

  const s = seats[0];
  const startHH = String(s.startTime).substring(8, 10);
  const startMM = String(s.startTime).substring(10, 12);
  const endHH = String(s.endTime).substring(8, 10);
  const endMM = String(s.endTime).substring(10, 12);
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
    <div className="flex h-screen w-full flex-col items-center overflow-hidden bg-gray-100 px-6">
      <BackWardPageButton title="좌석 상세" />

      {/* 티켓 */}
      <div className="mt-4 w-full overflow-hidden rounded-2xl shadow-xl">
        {/* 상단: 파란 헤더 */}
        <div className="bg-blue px-5 pb-6 pt-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold text-white">
              {s.trainType}
            </span>
            <span className="text-xs text-white/80">{s.startDayForView}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-2xl font-black text-white">
                {s.startStationForView}
              </span>
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
              <span className="text-2xl font-black text-white">
                {s.endStationForView}
              </span>
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
        <div className="bg-white px-5 py-4">
          <div className="flex flex-col gap-3">
            <Row
              label="호차 / 좌석"
              value={`${s.trainNoId}호차  ${filtred.join(', ')}`}
            />
            <Row
              label="인원"
              value={`어른 ${s.selectAdult}명 · 어린이 ${s.selectKid}명`}
            />
            <Row
              label="요금"
              value={`${s.selectPay.toLocaleString('ko-KR')}원`}
              bold
            />
          </div>
        </div>

        {/* 절취선 */}
        <div className="flex items-center bg-white py-3">
          <div className="mx-5 flex-1 border-t-2 border-dashed border-gray-300" />
        </div>

        {/* 하단: QR */}
        <div className="flex flex-col items-center gap-2 bg-white px-5 py-4">
          <QRCode value={qrValue} size={120} level="L" />
          <a
            href={qrValue}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-blue underline"
          >
            링크로 열기
          </a>
        </div>
      </div>

      {/* 좌석 변경 버튼 */}
      <div className="mt-4 w-full">
        <button
          onClick={() => {
            navigate('/seatchange', {
              state: Array.isArray(seats) ? seats : [seats],
            });
          }}
          className="w-full rounded-2xl bg-blue py-3.5 text-base font-bold text-white active:brightness-95"
        >
          좌석 변경
        </button>
      </div>
    </div>
  );
});

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

TicketSeatChangePage.displayName = 'TicketSeatChangePage';

export default TicketSeatChangePage;
