import { useNaviation } from '../hooks/TicketChangeHook';
import { useTicketLocation } from '../hooks/useTicketLocation';
import { SeatType } from '@/entities/Seat/types/seatType';
import { useReset } from '../hooks/useReset';
import BackWardPageButton from '@/widgets/layouts/ui/BackWardPageButton';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import { resolveRoute, normalizeStation } from '@/shared/lib/trainRoutes';
import { stationCoords } from '@/shared/lib/stationCoords';
import {
  CustomOverlayMap,
  Map,
  MapMarker,
  Polyline,
  useKakaoLoader,
} from 'react-kakao-maps-sdk';

const parseDateTime = (
  st: number,
  dur: number,
): { departure: Date; arrival: Date } => {
  const s = String(st);
  const departure = new Date(
    Number(s.substring(0, 4)),
    Number(s.substring(4, 6)) - 1,
    Number(s.substring(6, 8)),
    Number(s.substring(8, 10)),
    Number(s.substring(10, 12)),
  );
  const arrival = new Date(departure.getTime() + dur * 60 * 1000);
  return { departure, arrival };
};

const TicketSeatChangePage = memo(() => {
  const { navigate } = useNaviation();
  const { location } = useTicketLocation();
  const seats: SeatType[] = location.state.groups;

  const [showRoute, setShowRoute] = useState(false);
  const [mapView, setMapView] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useKakaoLoader({
    appkey: import.meta.env.VITE_APP_KAKAO_JS_KEY as string,
  });

  const filtred = useMemo(() => seats?.map((id) => id.seatId), [seats]);

  const segmentStations = useMemo(() => {
    const s = seats?.[0];
    if (!s) return [];
    const { route, gradeName } = resolveRoute(s.trainType);
    const startName = normalizeStation(s.startStationForView, gradeName);
    const endName = normalizeStation(s.endStationForView, gradeName);
    const findIdx = (name: string) => {
      const exact = route.indexOf(name);
      if (exact !== -1) return exact;
      return route.findIndex((r) => r.includes(name) || name.includes(r));
    };
    const startIdx = findIdx(startName);
    const endIdx = findIdx(endName);
    if (startIdx === -1 || endIdx === -1) return [];
    return startIdx < endIdx
      ? route.slice(startIdx, endIdx + 1)
      : route.slice(endIdx, startIdx + 1).reverse();
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
  let dur =
    Number(endHH) * 60 +
    Number(endMM) -
    (Number(startHH) * 60 + Number(startMM));
  if (dur < 0) dur += 24 * 60;
  const durText =
    dur >= 60
      ? `${Math.floor(dur / 60)}시간 ${dur % 60 > 0 ? `${dur % 60}분` : ''}`
      : `${dur}분`;

  const { departure, arrival } = parseDateTime(s.startTime, dur);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const total = arrival.getTime() - departure.getTime();
      const elapsed = now - departure.getTime();
      setProgress(Math.min(Math.max(elapsed / total, 0), 1));
    };
    tick();
    intervalRef.current = setInterval(tick, 10000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-gray-100 px-6 pb-8">
      <div className="w-full">
        <BackWardPageButton title="좌석 상세" />
      </div>

      {/* 전환 버튼 */}
      <div className="mb-3 mt-3 flex w-full rounded-2xl bg-white p-1 shadow-sm">
        <button
          onClick={() => setShowRoute(false)}
          className={`flex-1 rounded-xl py-2 text-sm font-bold transition-all ${
            !showRoute ? 'bg-blue text-white shadow-sm' : 'text-gray-400'
          }`}
        >
          티켓
        </button>
        <button
          onClick={() => setShowRoute(true)}
          className={`flex-1 rounded-xl py-2 text-sm font-bold transition-all ${
            showRoute ? 'bg-blue text-white shadow-sm' : 'text-gray-400'
          }`}
        >
          구간
        </button>
      </div>

      {/* 카드 교차 영역 */}
      <div className="relative w-full">
        {/* 티켓 카드 — 항상 플로우, 컨테이너 높이 결정 */}
        <div
          className="w-full transition-opacity duration-[400ms]"
          style={{
            opacity: showRoute ? 0 : 1,
            pointerEvents: showRoute ? 'none' : 'auto',
          }}
        >
          <div className="rounded-2xl bg-white shadow-xl">
            {/* 파란 헤더 */}
            <div className="rounded-t-2xl bg-blue px-5 pb-6 pt-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold text-white">
                  {s.trainType}
                </span>
                <span className="text-xs text-white/80">
                  {s.startDayForView}
                </span>
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
                <div className="flex flex-1 flex-col items-center gap-1">
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
            {/* 상세 정보 */}
            <div className="px-5 py-4">
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
            {/* 절취선 + QR */}
            <div className="flex items-center py-3">
              <div className="mx-5 flex-1 border-t-2 border-dashed border-gray-300" />
            </div>
            <div className="flex flex-col items-center gap-2 px-5 pb-5">
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
        </div>

        {/* 구간 카드 — 항상 absolute, 티켓 카드와 동일 높이, 내부 스크롤 */}
        <div
          className="absolute inset-0 transition-opacity duration-[400ms]"
          style={{
            opacity: showRoute ? 1 : 0,
            pointerEvents: showRoute ? 'auto' : 'none',
          }}
        >
          <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            {/* 파란 헤더 */}
            <div className="rounded-t-2xl bg-blue px-5 pb-5 pt-5">
              <div className="mb-1 flex items-center justify-between">
                <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold text-white">
                  {s.trainType}
                </span>
                <span className="text-xs text-white/80">
                  {s.startDayForView}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-base font-black text-white">
                  {s.startStationForView}
                </span>
                <span className="text-white/60">→</span>
                <span className="text-base font-black text-white">
                  {s.endStationForView}
                </span>
                <span className="text-xs text-white/70">{durText}</span>
                <button
                  onClick={() => setMapView((v) => !v)}
                  className="ml-auto rounded-lg bg-white/20 px-2.5 py-1 text-xs font-bold text-white transition-all active:brightness-90"
                >
                  {mapView ? '목록' : '지도'}
                </button>
              </div>
            </div>

            {/* 목록 뷰 */}
            {!mapView && (
              <div className="flex flex-1 flex-col px-5 pb-4 pt-3">
                {segmentStations.map((station, i) => {
                  const stationProgress = i / (segmentStations.length - 1);
                  const isPassed = progress >= stationProgress;
                  const isStart = i === 0;
                  const isEnd = i === segmentStations.length - 1;
                  return (
                    <div
                      key={station}
                      className={`flex flex-col ${!isEnd ? 'flex-1' : ''}`}
                    >
                      <div className="flex items-center gap-x-3">
                        <div
                          className="z-10 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2"
                          style={{
                            borderColor: isPassed ? '#2563eb' : '#e5e7eb',
                            backgroundColor: isPassed ? '#2563eb' : '#ffffff',
                          }}
                        >
                          {(isStart || isEnd) && (
                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </div>
                        <div className="flex flex-1 items-center justify-between">
                          <span
                            className={`text-sm font-bold ${isPassed ? 'text-gray-800' : 'text-gray-300'}`}
                          >
                            {station}
                          </span>
                          <span
                            className={`text-xs font-medium ${isPassed ? 'text-blue' : 'text-gray-300'}`}
                          >
                            {(() => {
                              const t = new Date(
                                departure.getTime() +
                                  (i / (segmentStations.length - 1)) *
                                    dur *
                                    60 *
                                    1000,
                              );
                              const hh = String(t.getHours()).padStart(2, '0');
                              const mm = String(t.getMinutes()).padStart(
                                2,
                                '0',
                              );
                              return isStart
                                ? `${hh}:${mm} 출발`
                                : isEnd
                                  ? `${hh}:${mm} 도착`
                                  : `${hh}:${mm}`;
                            })()}
                          </span>
                        </div>
                      </div>
                      {!isEnd &&
                        (() => {
                          const segStart = i / (segmentStations.length - 1);
                          const segEnd = (i + 1) / (segmentStations.length - 1);
                          const inSegment =
                            progress > segStart && progress < segEnd;
                          const segProgress = inSegment
                            ? (progress - segStart) / (segEnd - segStart)
                            : 0;
                          return (
                            <div className="relative ml-[7px] w-[2px] flex-1 bg-[#e5e7eb]">
                              {/* 파란 진행선 */}
                              <div
                                className="absolute left-0 top-0 w-full"
                                style={{
                                  height: inSegment
                                    ? `${segProgress * 100}%`
                                    : progress >= segEnd
                                      ? '100%'
                                      : '0%',
                                  backgroundColor: '#2563eb',
                                }}
                              />
                              {/* 이동 중 ping */}
                              {inSegment && (
                                <div
                                  className="absolute left-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
                                  style={{ top: `${segProgress * 100}%` }}
                                >
                                  <span className="relative flex h-3 w-3">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue opacity-75" />
                                    <span className="relative inline-flex h-3 w-3 rounded-full bg-blue" />
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 지도 뷰 */}
            {mapView && (
              <RouteMap
                stations={segmentStations}
                departureMs={departure.getTime()}
                arrivalMs={arrival.getTime()}
              />
            )}
          </div>
        </div>
      </div>

      {/* 좌석 변경 버튼 */}
      <div className="mt-3 w-full">
        <button
          onClick={() =>
            navigate('/seatchange', {
              state: Array.isArray(seats) ? seats : [seats],
            })
          }
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

const TrainPing = ({
  coords,
  departureMs,
  arrivalMs,
}: {
  coords: { lat: number; lng: number }[];
  departureMs: number;
  arrivalMs: number;
}) => {
  const [trainPos, setTrainPos] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const total = arrivalMs - departureMs;
      const elapsed = now - departureMs;
      const p = Math.min(Math.max(elapsed / total, 0), 1);
      if (p <= 0 || p >= 1 || coords.length < 2) {
        setTrainPos(null);
        return;
      }
      const idx = p * (coords.length - 1);
      const i = Math.floor(idx);
      const t = idx - i;
      const a = coords[Math.min(i, coords.length - 1)];
      const b = coords[Math.min(i + 1, coords.length - 1)];
      setTrainPos({
        lat: a.lat + (b.lat - a.lat) * t,
        lng: a.lng + (b.lng - a.lng) * t,
      });
    };
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, [coords, departureMs, arrivalMs]);

  if (!trainPos) return null;
  return (
    <CustomOverlayMap position={trainPos}>
      <span className="relative flex h-4 w-4">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue opacity-75" />
        <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue text-[8px]">
          🚄
        </span>
      </span>
    </CustomOverlayMap>
  );
};

const RouteMap = memo(
  ({
    stations,
    departureMs,
    arrivalMs,
  }: {
    stations: string[];
    departureMs: number;
    arrivalMs: number;
  }) => {
    const coords = useMemo(
      () => stations.map((st) => stationCoords[st]).filter(Boolean),
      [stations],
    );
    const midCoord = coords[Math.floor(coords.length / 2)] ?? coords[0];

    if (!midCoord) return null;

    return (
      <div className="min-h-0 flex-1 overflow-hidden rounded-b-2xl">
        <Map
          center={midCoord}
          style={{ width: '100%', height: '100%', minHeight: '200px' }}
          onCreate={(map) => {
            if (coords.length < 2) return;
            const bounds = new window.kakao.maps.LatLngBounds();
            coords.forEach((c) =>
              bounds.extend(new window.kakao.maps.LatLng(c.lat, c.lng)),
            );
            map.setBounds(bounds, 60);
          }}
        >
          <Polyline
            path={coords}
            strokeWeight={4}
            strokeColor="#2563eb"
            strokeOpacity={0.9}
            strokeStyle="solid"
          />
          {coords.map((coord, i) => (
            <MapMarker key={i} position={coord} title={stations[i]} />
          ))}
          <TrainPing
            coords={coords}
            departureMs={departureMs}
            arrivalMs={arrivalMs}
          />
        </Map>
      </div>
    );
  },
);

RouteMap.displayName = 'RouteMap';

export default TicketSeatChangePage;
