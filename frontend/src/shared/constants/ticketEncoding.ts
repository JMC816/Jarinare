/**
 * QR 페이로드 숫자 인코딩 매핑
 * 한글 역명 → 3자리 숫자 코드, 열차 타입 → 2자리 숫자 코드
 * numeric mode QR은 byte mode보다 ~2.4배 효율적 → 같은 크기에서 점이 더 커짐
 */

export const STATION_TO_CODE: Record<string, string> = {
  '가평': '001', '강릉': '002', '강촌': '003', '경산': '004', '경주': '005',
  '계룡': '006', '고래불': '007', '고한': '008', '곡성': '009', '공주': '010',
  '광명': '011', '광주송정': '012', '구례구': '013', '구미': '014', '구포': '015',
  '군산': '016', '근덕': '017', '기성': '018', '기장': '019', '김제': '020',
  '김천': '021', '김천구미': '022', '나주': '023', '남원': '024', '남춘천': '025',
  '논산': '026', '단양': '027', '대전': '028', '대천': '029', '동대구': '030',
  '동탄': '031', '동해': '032', '둔내': '033', '마석': '034', '만종': '035',
  '매화': '036', '목포': '037', '묵호': '038', '민둥산': '039', '밀양': '040',
  '별어곡': '041', '부산': '042', '부전': '043', '사릉': '044', '사북': '045',
  '삼척': '046', '상봉': '047', '서대전': '048', '서울': '049', '서울역': '049',
  '서원주': '050', '선평': '051', '센텀': '052', '수서': '053', '수원': '054',
  '순천': '055', '신경주': '056', '신창': '057', '신해운대': '058', '아산': '059',
  '아우라지': '060', '아화': '061', '안동': '062', '양평': '063', '여수EXPO': '064',
  '여천': '065', '영덕': '066', '영등포': '067', '영월': '068', '영주': '069',
  '영천': '070', '예산': '071', '오송': '072', '옥원': '073', '옥천': '074',
  '온양온천': '075', '용산': '076', '울산': '077', '울진': '078', '원주': '079',
  '월포': '080', '익산': '081', '임원': '082', '장사': '083', '장항': '084',
  '전주': '085', '정동진': '086', '정선': '087', '정읍': '088', '제천': '089',
  '조치원': '090', '죽변': '091', '진부': '092', '천안': '093', '천안아산': '094',
  '청도': '095', '청량리': '096', '청평': '097', '춘천': '098', '태백': '099',
  '태화강': '100', '퇴계원': '101', '평내호평': '102', '평창': '103', '평택': '104',
  '평택지제': '105', '포항': '106', '풍기': '107', '하양': '108', '홍성': '109',
  '횡성': '110', '후포': '111', '흥부': '112',
};

export const CODE_TO_STATION: Record<string, string> = Object.fromEntries(
  Object.entries(STATION_TO_CODE)
    .filter(([name]) => name !== '서울역')
    .map(([name, code]) => [code, name]),
);

export const TRAIN_TYPE_TO_CODE: Record<string, string> = {
  'KTX': '01',
  'KTX-산천': '02',
  'KTX-산천A': '02', 'KTX-산천(A-type)': '02', 'KTX-산천 A': '02',
  'KTX-산천B': '03', 'KTX-산천(B-type)': '03', 'KTX-산천 B': '03',
  'KTX-청룡': '04',
  'SRT': '05',
  '새마을호': '06',
  'ITX-새마을호': '07', 'ITX-새마을': '07',
  '무궁화호': '08', '무궁화': '08',
  'ITX-청춘': '09',
  'ITX-마음': '10',
};

export const CODE_TO_TRAIN_TYPE: Record<string, string> = {
  '01': 'KTX', '02': 'KTX-산천A', '03': 'KTX-산천B', '04': 'KTX-청룡',
  '05': 'SRT', '06': '새마을호', '07': 'ITX-새마을호', '08': '무궁화호',
  '09': 'ITX-청춘', '10': 'ITX-마음',
};

const COL_TO_CODE: Record<string, string> = {
  A: '1', B: '2', C: '3', D: '4', E: '5', F: '6', G: '7', H: '8',
};
const CODE_TO_COL: Record<string, string> = Object.fromEntries(
  Object.entries(COL_TO_CODE).map(([k, v]) => [v, k]),
);

// seatId 형식: colLabel + rowNo (예: B0, A1, C10) — CONCAT(col, rowNo) 순서
export const encodeSeat = (seat: string): string => {
  const col = COL_TO_CODE[seat[0]] ?? '0';
  const row = seat.slice(1).padStart(2, '0');
  return row + col;
};

export const decodeSeat = (code: string): string => {
  const row = String(parseInt(code.slice(0, 2), 10));
  const col = CODE_TO_COL[code.slice(2)] ?? code.slice(2);
  return col + row;
};

/**
 * 포맷: [startTime:12][duration:4][stStart:3][stEnd:3][trainType:2][car:2][seatCount:1][seats:3*n][adult:1][kid:1][price:7][reservationIds:10*n]
 * 인코딩 불가 시 null 반환
 */
export const encodeTicketNumeric = (params: {
  startTime: number;
  dur: number;
  startStation: string;
  endStation: string;
  trainType: string;
  car: string;
  seats: string[];
  adult: number;
  kid: number;
  price: number;
  reservationIds?: number[];
}): string | null => {
  const stStart = STATION_TO_CODE[params.startStation];
  const stEnd = STATION_TO_CODE[params.endStation];
  const trainCode = TRAIN_TYPE_TO_CODE[params.trainType];
  if (!stStart || !stEnd || !trainCode) return null;

  const rids = (params.reservationIds ?? []).map((id) => String(id).padStart(10, '0')).join('');

  return (
    String(params.startTime) +
    String(params.dur).padStart(4, '0') +
    stStart +
    stEnd +
    trainCode +
    String(params.car).padStart(2, '0') +
    String(params.seats.length) +
    params.seats.map(encodeSeat).join('') +
    String(params.adult) +
    String(params.kid) +
    String(params.price).padStart(7, '0') +
    rids
  );
};

export const decodeTicketNumeric = (hash: string) => {
  const startTime = Number(hash.slice(0, 12));
  const dur = Number(hash.slice(12, 16));
  const s = CODE_TO_STATION[hash.slice(16, 19)] ?? '';
  const e = CODE_TO_STATION[hash.slice(19, 22)] ?? '';
  const tp = CODE_TO_TRAIN_TYPE[hash.slice(22, 24)] ?? '';
  const c = String(parseInt(hash.slice(24, 26), 10));
  const seatCount = Number(hash.slice(26, 27));
  const seatsStart = 27;
  const ss = Array.from({ length: seatCount }, (_, i) =>
    decodeSeat(hash.slice(seatsStart + i * 3, seatsStart + i * 3 + 3)),
  );
  const tail = seatsStart + seatCount * 3;
  const a = Number(hash.slice(tail, tail + 1));
  const k = Number(hash.slice(tail + 1, tail + 2));
  const p = Number(hash.slice(tail + 2, tail + 9));

  const ridsStart = tail + 9;
  const rids: number[] = [];
  for (let i = 0; i < seatCount; i++) {
    const rid = Number(hash.slice(ridsStart + i * 10, ridsStart + i * 10 + 10));
    if (rid > 0) rids.push(rid);
  }

  const stStr = String(startTime);
  const dep = new Date(
    Number(stStr.slice(0, 4)),
    Number(stStr.slice(4, 6)) - 1,
    Number(stStr.slice(6, 8)),
    Number(stStr.slice(8, 10)),
    Number(stStr.slice(10, 12)),
  );
  const arr = new Date(dep.getTime() + dur * 60 * 1000);
  const et = Number(
    `${arr.getFullYear()}` +
    String(arr.getMonth() + 1).padStart(2, '0') +
    String(arr.getDate()).padStart(2, '0') +
    String(arr.getHours()).padStart(2, '0') +
    String(arr.getMinutes()).padStart(2, '0'),
  );

  return { s, e, st: startTime, et, tp, c, ss, a, k, p, rids };
};
