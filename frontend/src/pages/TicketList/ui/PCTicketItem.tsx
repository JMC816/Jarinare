/**
 * @role: pages — PC 개별 티켓 아이템 (QR/구간 토글 포함)
 * @rule: 레이아웃·조합만 담당, 토글 UI 상태만 허용
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { SeatType } from '@/entities/Seat/types/seatType';
import { useTicketDetail } from '@/features/TicketChange/hooks/useTicketDetail';
import { RouteMap } from '@/widgets/TicketChange/ui/RouteCard';
import StyledQRCode from '@/shared/ui/StyledQRCode';

type Panel = 'route' | 'qr';
type RouteView = 'stations' | 'map';


interface PCTicketItemProps {
  groups: SeatType[];
  ticket: SeatType;
  trainTypeName: string;
  startLabel: string;
  endLabel: string;
  startAmPm: string;
  endAmPm: string;
  dotDate: string;
  koreanDate: string;
  ticketNo: string;
  onSeatChange: (groups: SeatType[]) => void;
}

const PCTicketItem = ({
  groups,
  trainTypeName,
  startLabel,
  endLabel,
  dotDate,
  ticketNo,
  onSeatChange,
}: PCTicketItemProps) => {
  const [panel, setPanel] = useState<Panel>('route');
  const [routeView, setRouteView] = useState<RouteView>('stations');
  const upperCardRef = useRef<HTMLDivElement>(null);
  const [lowerPanelHeight, setLowerPanelHeight] = useState<number | undefined>(undefined);
  useEffect(() => {
    const el = upperCardRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setLowerPanelHeight(el.offsetHeight));
    ro.observe(el);
    setLowerPanelHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  const { s, segmentStations, departure, arrival, durText, qrValue } =
    useTicketDetail(groups);

  const dDayLabel = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dep = new Date(departure);
    dep.setHours(0, 0, 0, 0);
    const diff = Math.round(
      (dep.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diff === 0) return 'D-day';
    return diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
  }, [departure]);

  const shortDate = dotDate.slice(5);
  const DAY_KR = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const dayOfWeek = DAY_KR[departure.getDay()];
  const stopCount = Math.max(0, segmentStations.length - 2);
  const oddStops = segmentStations.filter(
    (_, i, arr) => i % 2 === 0 || i === arr.length - 1,
  );

  // @role: 실시간 상태 — 1초마다 현재 시각 갱신
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const status =
    now < departure ? ('before' as const)
    : now < arrival ? ('running' as const)
    : ('done' as const);

  const totalMs = arrival.getTime() - departure.getTime();
  const progress =
    totalMs > 0 && status === 'running'
      ? (now.getTime() - departure.getTime()) / totalMs
      : status === 'done'
        ? 1
        : 0;

  const ns = segmentStations.length;
  const segProgress = ns > 1 ? progress * (ns - 1) : 0;
  const currentSegIdx = ns > 1 ? Math.min(Math.floor(segProgress), ns - 2) : 0;
  const nextStationIdx = Math.min(currentSegIdx + 1, ns - 1);
  const pingLeftPct = ns > 1 ? ((0.5 + progress * (ns - 1)) / ns) * 100 : 50;

  const msUntilDep = Math.max(0, departure.getTime() - now.getTime());
  const minsUntil = Math.ceil(msUntilDep / 60000);
  const daysUntil = Math.floor(minsUntil / (60 * 24));
  const remMins = minsUntil % (60 * 24);
  const hoursUntil = Math.floor(remMins / 60);
  const minutesUntil = remMins % 60;
  const timeUntilDep = [
    daysUntil > 0 ? `${daysUntil}일` : '',
    hoursUntil > 0 ? `${hoursUntil}시간` : '',
    minutesUntil > 0 || (daysUntil === 0 && hoursUntil === 0) ? `${minutesUntil}분` : '',
  ].filter(Boolean).join(' ');

  const msUntilArr = Math.max(0, arrival.getTime() - now.getTime());
  const minsUntilArr = Math.ceil(msUntilArr / 60000);
  const daysUntilArr = Math.floor(minsUntilArr / (60 * 24));
  const remMinsArr = minsUntilArr % (60 * 24);
  const hoursUntilArr = Math.floor(remMinsArr / 60);
  const minutesUntilArr = remMinsArr % 60;
  const timeUntilArr = [
    daysUntilArr > 0 ? `${daysUntilArr}일` : '',
    hoursUntilArr > 0 ? `${hoursUntilArr}시간` : '',
    minutesUntilArr > 0 || (daysUntilArr === 0 && hoursUntilArr === 0) ? `${minutesUntilArr}분` : '',
  ].filter(Boolean).join(' ');
  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const depTimeStr = `${String(departure.getHours()).padStart(2, '0')}:${String(departure.getMinutes()).padStart(2, '0')}`;
  const arrTimeStr = `${String(arrival.getHours()).padStart(2, '0')}:${String(arrival.getMinutes()).padStart(2, '0')}`;
  const stationTimeStr = (i: number) => {
    if (ns <= 1) return depTimeStr;
    const t = new Date(departure.getTime() + (i / (ns - 1)) * totalMs);
    return `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
  };

  // @role: 운행중 줄선 줄무늬 애니메이션 스타일
  const stripeStyle: CSSProperties = {
    background:
      'repeating-linear-gradient(90deg, #EA4335 0px, #EA4335 6px, rgba(234,67,53,0.3) 6px, rgba(234,67,53,0.3) 12px)',
    backgroundSize: '24px 100%',
    animation: 'routeStripe 0.4s linear infinite',
    height: '3px',
    border: 'none',
  };

  return (
    <div className="flex flex-col gap-1">
      {/* 컴팩트 티켓 카드 */}
      <div ref={upperCardRef} className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="flex items-stretch">
          {/* 왼쪽: 헤더 + 날짜/노선 */}
          <div className="flex flex-1 flex-col">
            {/* 파란 헤더 */}
            <div className="flex items-center justify-between bg-blue px-5 py-2.5">
              <span className="text-sm font-bold text-white">
                {trainTypeName}
                <span className="ml-1.5 text-white/60"> 승차권</span>
              </span>
              <span className="font-mono text-xs text-white/60">
                {ticketNo}
              </span>
            </div>

            {/* 날짜 + 노선 */}
            <div className="flex flex-1 items-stretch gap-8 px-6 py-5">
              {/* 날짜 */}
              <div className="flex shrink-0 flex-col pt-4">
                <span className="text-xs font-bold text-blue">{dDayLabel}</span>
                <span className="text-xl font-semibold leading-snug text-gray-900">
                  {shortDate}
                </span>
                <span className="text-xs text-gray-400">{dayOfWeek}</span>
              </div>

              {/* 노선 */}
              <div className="flex flex-1 items-center gap-2">
                <div className="flex shrink-0 flex-col">
                  <p className="text-xl font-black text-gray-900">
                    {s.startStationForView}
                  </p>
                  <p className="text-xs text-gray-400">{startLabel} 출발</p>
                </div>

                <div className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs text-gray-400">
                    {durText}{stopCount > 0 ? ` · ${stopCount}개역 정차` : ''}
                  </span>
                  <div className="flex w-full items-start">
                    {oddStops.map((stop, i) => {
                      const isFirst = i === 0;
                      const isLast = i === oddStops.length - 1;
                      return (
                        <div
                          key={`${stop}-${i}`}
                          className="relative flex flex-1 flex-col items-center"
                        >
                          {!isFirst && (
                            <div className="absolute left-0 right-[calc(50%+4px)] top-[4px] border-t border-dashed border-gray-300" />
                          )}
                          {!isLast && (
                            <div className="absolute left-[calc(50%+4px)] right-0 top-[4px] border-t border-dashed border-gray-300" />
                          )}
                          <div
                            className={`relative z-10 rounded-full ${
                              isFirst
                                ? 'h-2.5 w-2.5 bg-blue'
                                : isLast
                                  ? 'h-2.5 w-2.5 border border-blue bg-white'
                                  : 'h-2 w-2 border border-gray-300 bg-white'
                            }`}
                          />
                          {!isFirst && !isLast && (
                            <span className="mt-1 text-center text-[9px] leading-tight text-gray-400">
                              {stop}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end">
                  <p className="text-xl font-black text-gray-900">
                    {s.endStationForView}
                  </p>
                  <p className="text-xs text-gray-400">{endLabel} 도착</p>
                </div>
              </div>
            </div>
          </div>

          {/* 점선 구분선 */}
          <div className="border-l border-dashed border-gray-200" />

          {/* 우측 패널 */}
          <div className="flex w-40 flex-col px-5">
            <div className="my-auto flex w-full flex-col items-center gap-3">
              <div className="w-full">
                <p className="mb-0.5 text-xs text-gray-400">좌석</p>
                <p className="text-xl font-black leading-tight text-blue">
                  {groups.map((g) => g.seatId).join(', ')}
                </p>
              </div>
              <div className="flex w-full flex-col gap-1">
                <div className="flex w-full rounded-xs bg-lightestGray p-0.5">
                  <button
                    onClick={() => setPanel('route')}
                    className={`flex-1 rounded-xs py-1.5 text-[13px] font-bold transition-colors ${
                      panel === 'route'
                        ? 'bg-white text-blue shadow-sm'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    구간
                  </button>
                  <button
                    onClick={() => setPanel('qr')}
                    className={`flex-1 rounded-xs py-1.5 text-[13px] font-bold transition-colors ${
                      panel === 'qr'
                        ? 'bg-white text-blue shadow-sm'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    QR
                  </button>
                </div>
                {(() => {
                  const isInspected = groups.some((g) => g.inspected);
                  const disabled = status === 'running' || isInspected;
                  return (
                    <button
                      onClick={() => !disabled && onSeatChange(groups)}
                      disabled={disabled}
                      className={`flex w-full items-center justify-center gap-0.5 rounded-xs py-1.5 text-[13px] font-bold transition-colors ${
                        disabled
                          ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                          : 'bg-blue text-white hover:bg-blue/90 active:brightness-95'
                      }`}
                    >
                      좌석변경
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 구간 패널 */}
      {panel === 'route' && (
        <div
          className={`overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-colors ${
            routeView === 'stations' ? 'bg-blue/5' : 'bg-white'
          }`}
          style={lowerPanelHeight && routeView !== 'map' ? { height: lowerPanelHeight } : undefined}
        >
          {/* 헤더 */}
          <div className="flex h-14 flex-row items-center justify-between px-5">
            <div className="flex items-center gap-3">
              {routeView === 'stations' ? (
                <>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue px-3 py-1 text-xs font-bold text-white">
                    <span className="text-[6px]">●</span>
                    <span className={status === 'running' ? 'animate-pulse' : ''}>
                      {status === 'before'
                        ? '출발전'
                        : status === 'running'
                          ? '운행 중'
                          : '도착 완료'}
                    </span>
                  </span>
                  {status === 'before' && (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm text-gray-800">
                        {s.startStationForView} 출발까지 {timeUntilDep}
                      </span>
                      <span className="text-xs text-gray-400">현재 {currentTimeStr}</span>
                    </div>
                  )}
                  {status === 'running' && (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm text-gray-800">
                        {s.startStationForView} → {s.endStationForView} 구간 · {s.endStationForView} 도착까지 {timeUntilArr}
                      </span>
                      <span className="text-xs text-gray-400">현재 {currentTimeStr}</span>
                    </div>
                  )}
                  {status === 'done' && (
                    <span className="text-sm text-gray-800">
                      {s.endStationForView}에 도착했습니다
                    </span>
                  )}
                </>
              ) : (
                <div className="flex items-baseline gap-2">
                  <p className="text-base font-bold text-gray-800">
                    {s.startStationForView} → {s.endStationForView}
                  </p>
                  {stopCount > 0 && (
                    <p className="text-sm font-normal text-gray-400">
                      {durText} · 정차 {stopCount}역
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="flex rounded-xs bg-lightestGray p-0.5">
              <button
                onClick={() => setRouteView('stations')}
                className={`rounded-xs px-3 py-1 text-xs font-medium transition-colors ${
                  routeView === 'stations'
                    ? 'bg-white text-black shadow-sm ring-2 ring-black'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                정차역
              </button>
              <button
                onClick={() => setRouteView('map')}
                className={`rounded-xs px-3 py-1 text-xs font-medium transition-colors ${
                  routeView === 'map'
                    ? 'bg-white text-black shadow-sm ring-2 ring-black'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                지도
              </button>
            </div>
          </div>

          {/* 콘텐츠 영역 — 헤더 아래 스크롤 */}
          <div
            className="overflow-y-auto"
            style={lowerPanelHeight && routeView !== 'map' ? { height: lowerPanelHeight - 56 } : undefined}
          >

          {/* 정차역 뷰 */}
          {routeView === 'stations' && (
            <div className="px-5 pb-6 pt-2">
              {/* @role: 줄무늬 이동 애니메이션 키프레임 */}
              <style>{`@keyframes routeStripe{from{background-position:0 0}to{background-position:24px 0}}`}</style>
              <div className="relative">
                {/* @role: 운행중 핑 — 노선 위를 이동하는 빨간 원 */}
                {/* @role: 현재 구간 오버레이 — 핑 이전 줄무늬 / 핑 이후 회색 */}
                {status === 'running' && ns > 1 && (
                  <>
                    <div
                      className="absolute z-[1] top-[4px]"
                      style={{
                        left: `calc(${((currentSegIdx + 0.5) / ns) * 100}% + 7px)`,
                        right: `${100 - pingLeftPct}%`,
                        ...stripeStyle,
                      }}
                    />
                    <div
                      className="absolute z-[1] top-[4px]"
                      style={{
                        left: `${pingLeftPct}%`,
                        right: `calc(${((ns - nextStationIdx - 0.5) / ns) * 100}% + 7px)`,
                        height: '3px',
                        backgroundColor: '#e5e7eb',
                      }}
                    />
                  </>
                )}

                {status === 'running' && ns > 0 && (
                  <div
                    className="pointer-events-none absolute z-20"
                    style={{
                      left: `${pingLeftPct}%`,
                      top: '5px',
                      width: '12px',
                      height: '12px',
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <span
                      className="absolute animate-ping rounded-full bg-red opacity-40"
                      style={{ width: '24px', height: '24px', left: '50%', top: '50%', marginLeft: '-12px', marginTop: '-12px' }}
                    />
                    <span className="absolute inset-0 rounded-full bg-red shadow-md ring-2 ring-white" />
                  </div>
                )}

                <div className="flex w-full items-start">
                  {segmentStations.map((stop, i) => {
                    const isFirst = i === 0;
                    const isLast = i === ns - 1;
                    const isNextStation =
                      status === 'running' && i === nextStationIdx;
                    const isPassed =
                      status === 'done' ||
                      (status === 'running' && i <= currentSegIdx);

                    // @role: 줄선 상태 판단 — 통과/현재구간/미통과
                    const leftLinePassed =
                      !isFirst &&
                      (status === 'done' ||
                        (status === 'running' && i - 1 < currentSegIdx));
                    const leftLineCurrent =
                      !isFirst &&
                      status === 'running' &&
                      i - 1 === currentSegIdx;
                    const rightLinePassed =
                      !isLast &&
                      (status === 'done' ||
                        (status === 'running' && i < currentSegIdx));
                    const rightLineCurrent =
                      !isLast && status === 'running' && i === currentSegIdx;

                    // @role: 동그라미 스타일 결정
                    let dotClass = '';
                    if (isFirst)
                      dotClass = 'h-3 w-3 bg-red';
                    else if (isLast && status === 'done')
                      dotClass = 'h-3 w-3 bg-red';
                    else if (isLast && status === 'before')
                      dotClass = 'h-3 w-3 border-2 border-gray-300 bg-white';
                    else if (isNextStation)
                      dotClass =
                        'h-2.5 w-2.5 border-2 border-orange-300 bg-orange-200';
                    else if (isPassed && isLast)
                      dotClass = 'h-3 w-3 bg-red';
                    else if (isPassed) dotClass = 'h-2.5 w-2.5 bg-red';
                    else if (isLast)
                      dotClass = 'h-3 w-3 border-2 border-gray-300 bg-white';
                    else
                      dotClass = 'h-2.5 w-2.5 border border-gray-300 bg-white';

                    return (
                      <div
                        key={`${stop}-${i}`}
                        className="relative flex flex-1 flex-col items-center"
                      >
                        {/* 왼쪽 줄선 — 현재구간은 부모 오버레이로 처리 */}
                        {!isFirst && !leftLineCurrent && (
                          <div
                            className="absolute left-0 top-[4px]"
                            style={{
                              right: 'calc(50% + 7px)',
                              ...(leftLinePassed
                                ? stripeStyle
                                : { height: '3px', backgroundColor: '#e5e7eb' }),
                            }}
                          />
                        )}
                        {/* 오른쪽 줄선 — 현재구간은 부모 오버레이로 처리 */}
                        {!isLast && !rightLineCurrent && (
                          <div
                            className="absolute top-[4px]"
                            style={{
                              left: 'calc(50% + 7px)',
                              right: 0,
                              ...(rightLinePassed
                                ? stripeStyle
                                : { height: '3px', backgroundColor: '#e5e7eb' }),
                            }}
                          />
                        )}

                        <div className={`relative z-10 rounded-full ${dotClass}`} />

                        <span
                          className={`mt-2 text-center text-xs leading-tight ${
                            isNextStation
                              ? 'font-bold text-orange-400'
                              : isLast && status === 'before'
                                ? 'text-gray-400'
                                : isFirst || isLast
                                  ? 'font-bold text-gray-900'
                                  : isPassed
                                    ? 'text-gray-600'
                                    : 'text-gray-400'
                          }`}
                        >
                          {stop}
                        </span>

                        <span className={`mt-0.5 text-[10px] ${isNextStation ? 'text-orange-400' : 'text-gray-400'}`}>
                          {isFirst
                            ? `${depTimeStr} 출발`
                            : isLast
                              ? `${arrTimeStr} 도착`
                              : stationTimeStr(i)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 지도 뷰 */}
          {routeView === 'map' && (
            <div className="flex flex-col px-6 pb-6" style={{ height: 300 }}>
              <div className="flex flex-1 flex-col overflow-hidden rounded-lg [&_*]:!rounded-lg">
                <RouteMap
                  stations={segmentStations}
                  departureMs={departure.getTime()}
                  arrivalMs={arrival.getTime()}
                />
              </div>
            </div>
          )}

          </div>{/* 콘텐츠 영역 끝 */}
        </div>
      )}

      {/* QR 패널 */}
      {panel === 'qr' && (
        <div className="overflow-hidden rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-5">
            <a href={qrValue} target="_blank" rel="noopener noreferrer" className="shrink-0">
              <StyledQRCode value={qrValue} size={120} />
            </a>
            <div className="flex flex-col gap-2">
              <div className="flex gap-4 text-sm">
                <span className="w-20 shrink-0 text-gray-400">승차권 번호</span>
                <span className="font-bold text-gray-800">{ticketNo}</span>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="w-20 shrink-0 text-gray-400">구간</span>
                <span className="font-bold text-gray-800">
                  {s.startStationForView} {startLabel} → {s.endStationForView}{' '}
                  {endLabel}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                탑승 전 QR코드를 준비해주세요.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PCTicketItem;
