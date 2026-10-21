import { useEffect } from 'react';
import { decodeTicketNumeric } from '@/shared/constants/ticketEncoding';
import { backendClient } from '@/shared/api/backendClient';

type TicketData = {
  s: string; e: string; st: number; et: number; tp: string;
  c: string; ss: string[]; a: number; k: number; p: number;
  rids?: number[];
};

const TicketViewPage = () => {
  const hash = window.location.hash.slice(1);
  if (!hash)
    return (
      <div className="p-8 text-center text-gray-400">잘못된 접근입니다.</div>
    );

  let d: TicketData;
  try {
    if (/^\d+$/.test(hash)) {
      d = decodeTicketNumeric(hash) as TicketData;
    } else {
      const normalized = hash.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(
        normalized.length + ((4 - (normalized.length % 4)) % 4),
        '=',
      );
      const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
      d = JSON.parse(new TextDecoder().decode(bytes)) as TicketData;
    }
  } catch {
    return (
      <div className="p-8 text-center text-gray-400">잘못된 접근입니다.</div>
    );
  }

  return <TicketView d={d} />;
};

const TicketView = ({ d }: { d: TicketData }) => {
  useEffect(() => {
    const rids = d.rids?.filter((id) => id > 0);
    if (!rids || rids.length === 0) return;
    backendClient.patch('/api/seats/reservations', { reservationIds: rids }).catch(() => {});
  }, []);
  const st = String(d.st);
  const et = String(d.et);

  const year = st.slice(0, 4);
  const month = st.slice(4, 6);
  const day = st.slice(6, 8);
  const startHH = st.slice(8, 10);
  const startMM = st.slice(10, 12);
  const endHH = et.slice(8, 10);
  const endMM = et.slice(10, 12);

  const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
  const DAY_KR = ['일', '월', '화', '수', '목', '금', '토'];
  const dayLabel = DAY_KR[dateObj.getDay()];

  let dur = Number(endHH) * 60 + Number(endMM) - (Number(startHH) * 60 + Number(startMM));
  if (dur < 0) dur += 24 * 60;
  const durText = dur >= 60
    ? `${Math.floor(dur / 60)}시간 ${dur % 60 > 0 ? `${dur % 60}분` : ''}`
    : `${dur}분`;

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-gray-50 px-5 py-10">
      {/* 헤더 */}
      <div className="mb-5 flex w-full max-w-sm items-center justify-between">
        <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">승차권 확인</span>
        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-600">
          ✓ 유효한 승차권
        </span>
      </div>

      {/* 티켓 카드 */}
      <div className="relative w-full max-w-sm">

        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
        {/* 파란 헤더 */}
        <div className="bg-blue px-6 pb-6 pt-5">
          <div className="mb-1 text-xs font-bold text-white/60">{year}년 {month}월 {day}일 ({dayLabel})</div>
          <div className="mb-4">
            <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold text-white">
              {d.tp}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-3xl font-black text-white">{d.s}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[10px] font-bold text-white/80">{startHH}:{startMM}</span>
                <span className="text-[10px] font-semibold text-white/50">출발</span>
              </div>
            </div>
            <div className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px] text-white/60">{durText}</span>
              <div className="flex w-full items-center gap-1">
                <div className="h-px flex-1 border-t border-dashed border-white/40" />
                <div className="h-px flex-1 border-t border-dashed border-white/40" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-3xl font-black text-white">{d.e}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[10px] font-bold text-white/80">{endHH}:{endMM}</span>
                <span className="text-[10px] font-semibold text-white/50">도착</span>
              </div>
            </div>
          </div>
        </div>

        {/* 호차/좌석 강조 — 점선 위 */}
        <div className="bg-white px-6 pt-5 pb-4">
          <div className="rounded-xl bg-blue/5 px-4 py-3">
            <p className="mb-0.5 text-xs text-gray-400">호차 / 좌석</p>
            <p className="text-xl font-black text-blue">
              {d.c}호차 &nbsp;{d.ss.join(', ')}
            </p>
          </div>
        </div>

        {/* 절취선 */}
        <div className="relative flex items-center bg-white py-3">
          <div className="absolute -left-3 h-6 w-6 rounded-full bg-gray-50" />
          <div className="mx-5 flex-1 border-t-2 border-dashed border-gray-200" />
          <div className="absolute -right-3 h-6 w-6 rounded-full bg-gray-50" />
        </div>

        {/* 부가 정보 — 점선 아래 */}
        <div className="bg-white px-6 pb-6">
          <div className="flex flex-col gap-2.5">
            <Row label="인원" value={`어른 ${d.a}명${d.k > 0 ? ` · 어린이 ${d.k}명` : ''}`} />
            <Row label="결제 금액" value={`${d.p.toLocaleString('ko-KR')}원`} bold />
          </div>
        </div>
        </div>{/* overflow-hidden 카드 끝 */}

        {/* 예매확정 스탬프 — 카드 위에 겹치기 */}
        <div
          className="pointer-events-none absolute right-6 top-[140px] z-10 rotate-[-18deg] flex h-[80px] w-[80px] items-center justify-center rounded-full"
          style={{ border: '3px solid #e00' }}
        >
          <div
            className="flex h-[64px] w-[64px] flex-col items-center justify-center rounded-full"
            style={{ border: '1.5px solid #e00' }}
          >
            <span className="text-[10px] font-black leading-tight tracking-[0.2em]" style={{ color: '#e00' }}>예매</span>
            <span className="text-[10px] font-black leading-tight tracking-[0.2em]" style={{ color: '#e00' }}>확정</span>
          </div>
        </div>
      </div>{/* relative 래퍼 끝 */}

      <p className="mt-6 text-center text-xs text-gray-400">
        본 화면을 승무원에게 제시해주세요
      </p>
    </div>
  );
};

const Row = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-gray-400">{label}</span>
    <span className={`text-sm ${bold ? 'font-bold text-blue' : 'font-semibold text-gray-800'}`}>
      {value}
    </span>
  </div>
);

export default TicketViewPage;
