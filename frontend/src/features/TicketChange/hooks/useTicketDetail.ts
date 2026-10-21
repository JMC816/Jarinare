/**
 * @role: features — 티켓 상세 데이터 가공 Hook
 * @rule: UI 렌더링 로직 포함 금지, 데이터 가공만 담당
 */
import { useMemo } from 'react';
import { SeatType } from '@/entities/Seat/types/seatType';
import { parseDateTime } from '@/shared/lib/formatDate';
import { encodeTicketNumeric } from '@/shared/constants/ticketEncoding';
import { getSegmentStations } from '@/shared/lib/trainRoutes';

export const useTicketDetail = (seats: SeatType[]) => {
  const s = seats[0];

  // 출발/도착 시각 파싱
  const startHH = String(s.startTime).substring(8, 10);
  const startMM = String(s.startTime).substring(10, 12);
  const endHH = String(s.endTime).substring(8, 10);
  const endMM = String(s.endTime).substring(10, 12);

  // 소요시간 계산 (분 단위, 자정 넘김 보정)
  let dur =
    Number(endHH) * 60 +
    Number(endMM) -
    (Number(startHH) * 60 + Number(startMM));
  if (dur < 0) dur += 24 * 60;

  const durText =
    dur >= 60
      ? `${Math.floor(dur / 60)}시간 ${dur % 60 > 0 ? `${dur % 60}분` : ''}`
      : `${dur}분`;

  const { departure, arrival } = useMemo(
    () => parseDateTime(s.startTime, dur),
    [s.startTime, dur],
  );

  const filtred = useMemo(() => seats.map((seat) => seat.seatId), [seats]);

  // 열차 노선에서 출발~도착 구간 역 추출
  const segmentStations = useMemo(
    () =>
      getSegmentStations(
        s.trainType,
        s.startStationForView,
        s.endStationForView,
      ),
    [s.trainType, s.startStationForView, s.endStationForView],
  );

  // 숫자 인코딩 QR URL 생성 (numeric mode → 더 큰 점), 불가 시 base64 fallback
  const qrValue = useMemo(() => {
    const numeric = encodeTicketNumeric({
      startTime: s.startTime, dur,
      startStation: s.startStationForView, endStation: s.endStationForView,
      trainType: s.trainType, car: s.trainNoId,
      seats: filtred, adult: s.selectAdult, kid: s.selectKid, price: s.selectPay,
      reservationIds: seats.map((seat) => seat.reservationId ?? 0),
    });
    if (numeric) return `${window.location.origin}/ticket/view?d=${numeric}`;

    const payload = JSON.stringify({
      s: s.startStationForView, e: s.endStationForView,
      st: s.startTime, et: s.endTime, tp: s.trainType,
      c: s.trainNoId, ss: filtred, a: s.selectAdult, k: s.selectKid, p: s.selectPay,
      rids: seats.map((seat) => seat.reservationId ?? 0),
    });
    const bytes = new TextEncoder().encode(payload);
    const b64 = btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(''))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return `${window.location.origin}/ticket/view?d=${b64}`;
  }, [s.startStationForView, s.endStationForView, s.startTime, s.endTime, s.trainType, s.trainNoId, s.selectAdult, s.selectKid, s.selectPay, dur, filtred]);

  return {
    s,
    filtred,
    segmentStations,
    qrValue,
    startHH,
    startMM,
    endHH,
    endMM,
    dur,
    durText,
    departure,
    arrival,
  };
};
