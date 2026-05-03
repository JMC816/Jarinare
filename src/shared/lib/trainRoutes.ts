export const trainRoutes: Record<string, string[]> = {
  KTX: [
    '서울',
    '광명',
    '천안아산',
    '오송',
    '대전',
    '김천구미',
    '동대구',
    '경주',
    '울산',
    '부산',
  ],
  'KTX-산천A': ['서울', '대전', '동대구', '울산', '부산'],
  'KTX-산천B': ['서울', '대전', '동대구', '포항'],
  'KTX-이음': [
    '서울',
    '청량리',
    '양평',
    '서원주',
    '원주',
    '제천',
    '단양',
    '풍기',
    '영주',
    '안동',
    '의성',
    '경주',
    '태화강',
    '남창',
    '센텀',
    '부전',
  ],
  'KTX-청룡': ['서울', '대전', '동대구', '부산'],
  SRT: [
    '수서',
    '동탄',
    '평택지제',
    '천안아산',
    '오송',
    '대전',
    '김천구미',
    '동대구',
    '부산',
  ],
  새마을호: [
    '서울',
    '영등포',
    '수원',
    '평택',
    '천안',
    '조치원',
    '대전',
    '김천',
    '구미',
    '대구',
    '밀양',
    '구포',
    '부산',
  ],
  'ITX-새마을호': [
    '서울',
    '영등포',
    '수원',
    '평택',
    '천안',
    '조치원',
    '대전',
    '동대구',
    '부산',
  ],
  무궁화호: [
    '서울',
    '영등포',
    '수원',
    '평택',
    '천안',
    '조치원',
    '대전',
    '김천',
    '구미',
    '대구',
    '경산',
    '밀양',
    '구포',
    '부산',
  ],
  'ITX-마음': [
    '서울',
    '영등포',
    '수원',
    '평택',
    '천안',
    '조치원',
    '대전',
    '김천',
    '구미',
    '대구',
    '밀양',
    '구포',
    '부산',
  ],
  'ITX-청춘': ['용산', '청량리', '평내호평', '가평', '강촌', '남춘천', '춘천'],
  누리호: [
    '강릉',
    '정동진',
    '묵호',
    '동해',
    '삼척',
    '근덕',
    '임원',
    '옥원',
    '흥부',
    '죽변',
    '울진',
    '매화',
    '기성',
    '후포',
    '고래불',
    '영덕',
    '장사',
    '월포',
    '포항',
    '아화',
    '영천',
    '하양',
    '동대구',
  ],
  통근열차: [
    '동두천',
    '보산',
    '동두천중앙',
    '지행',
    '덕정',
    '덕계',
    '양주',
    '녹양',
    '가능',
    '의정부',
    '회룡',
    '망월사',
    '도봉산',
    '도봉',
    '방학',
    '창동',
    '녹천',
    '월계',
    '광운대',
    '석계',
    '신이문',
    '외대앞',
    '회기',
    '청량리',
  ],
  AREX직통: ['서울역', '인천공항1터미널', '인천공항2터미널'],
};

// API 열차 등급명 → 내부 키 매핑
const trainTypeAliases: Record<string, string> = {
  'KTX-산천(A-type)': 'KTX-산천A',
  'KTX-산천(B-type)': 'KTX-산천B',
  'ITX-새마을': 'ITX-새마을호',
  무궁화: '무궁화호',
  'KTX-산천 A': 'KTX-산천A',
  'KTX-산천 B': 'KTX-산천B',
};

// 역명 별칭 (API 역명 → 노선 배열 역명)
const stationNameAliases: Record<string, string> = {
  '서울(수서)': '수서',
  '수서(서울)': '수서',
  '동탄(화성)': '동탄',
  '평택지제(삼성)': '평택지제',
  '천안아산(온양온천)': '천안아산',
  '오송(세종)': '오송',
  '김천(구미)': '김천구미',
  '울산(통도사)': '울산',
  인천공항T1: '인천공항1터미널',
  인천공항T2: '인천공항2터미널',
};

// 열차 타입별 역명 오버라이드 (검색 역명 → 실제 노선 역명)
// SRT는 서울역 검색 시 수서역으로 운행
const trainStationOverrides: Record<string, Record<string, string>> = {
  SRT: { 서울: '수서', 서울역: '수서' },
};

export const normalizeStation = (
  stationName: string,
  gradeName?: string,
): string => {
  if (gradeName && trainStationOverrides[gradeName]?.[stationName]) {
    return trainStationOverrides[gradeName][stationName];
  }
  return stationNameAliases[stationName] ?? stationName;
};

export const resolveRoute = (
  trainType: string,
): { route: string[]; gradeName: string } => {
  // 열차번호 suffix 제거 (예: "-00037", "-04031")
  const gradeName = trainType.replace(/-\d{4,}$/, '').trim();
  if (trainRoutes[gradeName])
    return { route: trainRoutes[gradeName], gradeName };
  const aliasKey = trainTypeAliases[gradeName];
  if (aliasKey && trainRoutes[aliasKey])
    return { route: trainRoutes[aliasKey], gradeName: aliasKey };
  const key = Object.keys(trainRoutes).find((k) => gradeName.startsWith(k));
  return key
    ? { route: trainRoutes[key], gradeName: key }
    : { route: [], gradeName };
};
