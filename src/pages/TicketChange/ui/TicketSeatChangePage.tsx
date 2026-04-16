import Ticket from '@/shared/ui/Ticket';
import { useNaviation } from '../hooks/TicketChangeHook';
import { useTicketLocation } from '../hooks/useTicketLocation';
import { SeatType } from '@/entities/Seat/types/seatType';
import { useReset } from '../hooks/useReset';
import BackWardPageButton from '@/widgets/layouts/ui/BackWardPageButton';
import { memo, useMemo, useState } from 'react';
import QRCode from 'react-qr-code';

const TicketSeatChangePage = memo(() => {
  const { navigate } = useNaviation();
  const { location } = useTicketLocation();
  const seats: SeatType[] = location.state.groups;

  const filtred = useMemo(() => {
    return seats?.map((id) => id.seatId);
  }, [seats]);

  const [showPreview, setShowPreview] = useState(false);

  useReset();

  if (!seats) return;

  const s = seats[0];
  const dh = Number(String(s.startTime).substring(8, 10));
  const dm = Number(String(s.startTime).substring(10, 12));
  const ah = Number(String(s.endTime).substring(8, 10));
  const am = Number(String(s.endTime).substring(10, 12));
  let dur = ah * 60 + am - (dh * 60 + dm);
  if (dur < 0) dur += 24 * 60;
  const durText =
    dur >= 60
      ? `${Math.floor(dur / 60)}시간 ${dur % 60 > 0 ? `${dur % 60}분` : ''}`
      : `${dur}분`;

  const startHHMM = `${String(s.startTime).substring(8, 10)}:${String(s.startTime).substring(10, 12)}`;
  const endHHMM = `${String(s.endTime).substring(8, 10)}:${String(s.endTime).substring(10, 12)}`;

  const html =
    `<!DOCTYPE html><html><head><meta charset=UTF-8><title>승차권</title></head>` +
    `<body style="background:#f3f4f6;font-family:sans-serif;display:flex;justify-content:center;padding:24px;min-height:100vh;margin:0">` +
    `<div style="background:#fff;border-radius:16px;padding:20px;width:320px;box-shadow:0 2px 8px rgba(0,0,0,.1)">` +
    `<b style="background:#E7F2FD;color:#0062FF;border-radius:6px;padding:2px 8px;font-size:12px">${s.trainType}</b>` +
    `<div style="display:flex;align-items:center;justify-content:space-between;margin:12px 0;font-size:16px;font-weight:bold">` +
    `<span>${s.startStationForView}</span>` +
    `<div style="flex:1;border-top:2px dashed #ccc;margin:0 8px"></div>` +
    `<span>🚄</span>` +
    `<div style="flex:1;border-top:2px dashed #ccc;margin:0 8px"></div>` +
    `<span>${s.endStationForView}</span></div>` +
    `<p style="margin:6px 0;font-size:13px"><span style="color:#999">출발 </span><b>${s.startDayForView}</b></p>` +
    `<p style="margin:6px 0;font-size:13px;color:#0062FF"><b>${startHHMM} → ${endHHMM}</b></p>` +
    `<p style="margin:6px 0;font-size:13px"><span style="color:#999">소요 </span><b>${durText}</b></p>` +
    `<p style="margin:6px 0;font-size:13px"><span style="color:#999">좌석 </span><b>${s.trainNoId}호 ${filtred.join(' ')}</b></p>` +
    `<p style="margin:6px 0;font-size:13px"><span style="color:#999">인원 </span><b>어른 ${s.selectAdult} · 아이 ${s.selectKid}</b></p>` +
    `<p style="margin:6px 0;font-size:13px"><span style="color:#999">요금 </span><b>${s.selectPay.toLocaleString('ko-KR')}원</b></p>` +
    `</div></body></html>`;

  const qrValue = `${window.location.origin}/ticket/view?data=${encodeURIComponent(
    JSON.stringify({
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
    }),
  )}`;

  return (
    <div className="flex min-h-screen w-full flex-col items-center overflow-y-auto bg-gray-100 pb-8 pl-[28px] pr-[27px]">
      <BackWardPageButton title="좌석 상세" />

      {/* 티켓 카드 */}
      <div className="mt-8 w-full overflow-hidden rounded-2xl bg-white px-5 py-5 shadow-sm">
        <div className="mb-4 flex w-full items-center justify-between text-base font-bold text-gray-900">
          <span>{seats[0].startStationForView}</span>
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
          <span>{seats[0].endStationForView}</span>
        </div>
        <Ticket
          seatIds={filtred}
          startTime={seats[0].startTime}
          endTime={seats[0].endTime}
          trainType={seats[0].trainType}
          trainNoId={seats[0].trainNoId}
          startDayForView={seats[0].startDayForView}
          selectKid={seats[0].selectKid}
          selectAdult={seats[0].selectAdult}
          selectPay={seats[0].selectPay}
        />

        {/* 구분선 */}
        <div className="my-3 border-t border-dashed border-gray-200" />

        {/* QR 코드 */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex justify-center rounded-2xl bg-gray-50 p-5">
            <QRCode value={qrValue} size={140} />
          </div>
          <span className="text-[10px] text-gray-400">
            {`${seats[0].startStationForView} → ${seats[0].endStationForView} · ${seats[0].startDayForView}`}
          </span>
          <button
            onClick={() => setShowPreview(true)}
            className="mt-1 rounded-xl bg-blue px-4 py-2 text-xs font-bold text-white active:brightness-95"
          >
            승차권 페이지 열기
          </button>
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

      {/* HTML 미리보기 오버레이 */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          <div className="flex items-center justify-between bg-gray-100 px-4 py-3">
            <span className="text-sm font-bold text-gray-700">승차권</span>
            <button
              onClick={() => setShowPreview(false)}
              className="text-sm font-bold text-blue"
            >
              닫기
            </button>
          </div>
          <iframe
            srcDoc={html}
            className="w-full flex-1 border-none"
            title="승차권"
          />
        </div>
      )}
    </div>
  );
});

TicketSeatChangePage.displayName = 'TicketSeatChangePage';

export default TicketSeatChangePage;
