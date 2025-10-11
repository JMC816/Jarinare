import { useState } from 'react';

const noticeData = [
  {
    id: '1',
    title: '시스템 점검 안내',
    content:
      '2024년 1월 15일 02:00~06:00 시스템 점검으로 인한 서비스 중단 안내드립니다. 이용에 불편을 드려 죄송합니다.',
    date: '2024.01.10',
    author: '관리자',
    likes: 12,
    comments: 5,
    isNotice: true,
    imageUrl:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
  },
  {
    id: '2',
    title: '신규 기능 업데이트',
    content:
      '모바일 앱에 새로운 예약 기능이 추가되었습니다. 더욱 편리한 서비스를 경험해보세요!',
    date: '2024.01.08',
    author: '개발팀',
    likes: 28,
    comments: 8,
    isNotice: true,
    imageUrl:
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop',
  },
  {
    id: '3',
    title: '서비스 이용약관 변경',
    content:
      '2024년 2월 1일부터 새로운 이용약관이 적용됩니다. 자세한 내용은 공지사항을 확인해주세요.',
    date: '2024.01.05',
    author: '법무팀',
    likes: 7,
    comments: 2,
    isNotice: true,
    imageUrl:
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop',
  },
  {
    id: '4',
    title: '결제 시스템 개선',
    content:
      '더욱 안전하고 편리한 결제 시스템으로 업그레이드되었습니다. 다양한 결제 수단을 지원합니다.',
    date: '2024.01.03',
    author: '결제팀',
    likes: 15,
    comments: 3,
    isNotice: true,
    imageUrl:
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
  },
  {
    id: '5',
    title: '고객센터 운영시간 변경',
    content:
      '평일 09:00~18:00, 주말 및 공휴일 휴무로 변경됩니다. 문의사항은 이메일로 부탁드립니다.',
    date: '2024.01.01',
    author: '고객지원팀',
    likes: 9,
    comments: 4,
    isNotice: true,
    imageUrl:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
  },
  {
    id: '6',
    title: '앱 버전 업데이트',
    content: '버그 수정 및 성능 개선이 포함된 새 버전이 출시되었습니다.',
    date: '2023.12.28',
    author: '개발팀',
    likes: 18,
    comments: 6,
    isNotice: true,
    imageUrl:
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop',
  },
  {
    id: '7',
    title: '연말연시 특별 할인',
    content: '12월 25일~1월 2일까지 특별 할인 이벤트를 진행합니다.',
    date: '2023.12.20',
    author: '마케팅팀',
    likes: 25,
    comments: 12,
    isNotice: true,
    imageUrl:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
  },
  {
    id: '8',
    title: '개인정보 처리방침 개정',
    content: '개인정보 보호를 위한 처리방침이 개정되었습니다.',
    date: '2023.12.15',
    author: '법무팀',
    likes: 11,
    comments: 3,
    isNotice: true,
    imageUrl:
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop',
  },
  {
    id: '9',
    title: '모바일 앱 다운로드 안내',
    content: '더욱 편리한 서비스 이용을 위해 모바일 앱을 다운로드하세요.',
    date: '2023.12.10',
    author: '개발팀',
    likes: 22,
    comments: 7,
    isNotice: true,
    imageUrl:
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
  },
  {
    id: '10',
    title: '서비스 이용 통계 공개',
    content: '2023년 연간 서비스 이용 통계를 공개합니다.',
    date: '2023.12.05',
    author: '데이터팀',
    likes: 16,
    comments: 4,
    isNotice: true,
    imageUrl:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
  },
  {
    id: '11',
    title: '보안 강화 조치',
    content: '사용자 정보 보호를 위한 보안 시스템을 강화했습니다.',
    date: '2023.11.30',
    author: '보안팀',
    likes: 13,
    comments: 2,
    isNotice: true,
    imageUrl:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
  },
  {
    id: '12',
    title: '고객 만족도 조사',
    content: '서비스 개선을 위한 고객 만족도 조사에 참여해주세요.',
    date: '2023.11.25',
    author: '고객지원팀',
    likes: 19,
    comments: 8,
    isNotice: true,
    imageUrl:
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop',
  },
  {
    id: '13',
    title: '신규 지점 오픈 안내',
    content:
      '부산 해운대역에 새로운 지점이 오픈했습니다. 많은 이용 부탁드립니다.',
    date: '2023.11.20',
    author: '운영팀',
    likes: 24,
    comments: 9,
    isNotice: true,
    imageUrl:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
  },
  {
    id: '14',
    title: '겨울철 특별 이벤트',
    content: '겨울철을 맞아 특별 할인 이벤트를 진행합니다. 놓치지 마세요!',
    date: '2023.11.15',
    author: '마케팅팀',
    likes: 31,
    comments: 14,
    isNotice: true,
    imageUrl:
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop',
  },
  {
    id: '15',
    title: '앱 다크모드 지원',
    content: '사용자 요청에 따라 다크모드 기능을 추가했습니다.',
    date: '2023.11.10',
    author: '개발팀',
    likes: 27,
    comments: 11,
    isNotice: true,
    imageUrl:
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
  },
  {
    id: '16',
    title: '서비스 이용 통계',
    content: '10월 서비스 이용 통계를 공개합니다. 많은 관심 부탁드립니다.',
    date: '2023.11.05',
    author: '데이터팀',
    likes: 18,
    comments: 6,
    isNotice: true,
    imageUrl:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
  },
  {
    id: '17',
    title: '보안 강화 조치',
    content: '사용자 정보 보호를 위한 보안 시스템을 강화했습니다.',
    date: '2023.10.30',
    author: '보안팀',
    likes: 13,
    comments: 2,
    isNotice: true,
    imageUrl:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
  },
  {
    id: '18',
    title: '고객 만족도 조사',
    content: '서비스 개선을 위한 고객 만족도 조사에 참여해주세요.',
    date: '2023.10.25',
    author: '고객지원팀',
    likes: 19,
    comments: 8,
    isNotice: true,
    imageUrl:
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop',
  },
  {
    id: '19',
    title: '신규 지점 오픈 안내',
    content:
      '대구 동대구역에 새로운 지점이 오픈했습니다. 많은 이용 부탁드립니다.',
    date: '2023.10.20',
    author: '운영팀',
    likes: 24,
    comments: 9,
    isNotice: true,
    imageUrl:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
  },
  {
    id: '20',
    title: '추석 연휴 특별 이벤트',
    content: '추석 연휴를 맞아 특별 할인 이벤트를 진행합니다. 놓치지 마세요!',
    date: '2023.10.15',
    author: '마케팅팀',
    likes: 31,
    comments: 14,
    isNotice: true,
    imageUrl:
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop',
  },
];

export const Event = () => {
  const [eventPage, setEventPage] = useState(1);

  const gridItemsPerPage = 12; // 3x4 그리드

  // 공지사항2 그리드 페이징 계산
  const gridTotalPages = Math.ceil(noticeData.length / gridItemsPerPage);
  const gridStartIndex = (eventPage - 1) * gridItemsPerPage;
  const gridEndIndex = gridStartIndex + gridItemsPerPage;
  const currentGridNotices = noticeData.slice(gridStartIndex, gridEndIndex);
  return (
    <div className="flex h-full flex-col bg-gray-50">
      {/* 3x4 그리드 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-3 gap-3">
          {currentGridNotices.map((notice) => (
            <div
              key={notice.id}
              className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow duration-200 hover:shadow-lg"
            >
              {/* 이미지 영역 */}
              <div className="aspect-square w-full">
                <img
                  src={notice.imageUrl}
                  alt={notice.title}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* 텍스트 영역 */}
              <div className="p-2">
                <div className="mb-1 flex items-center gap-1">
                  <div className="bg-red-500 rounded px-1 py-0.5 text-xs font-bold text-white">
                    공지
                  </div>
                </div>
                <h3 className="mb-1 line-clamp-1 text-xs font-bold text-gray-900">
                  {notice.title}
                </h3>
                <p className="line-clamp-1 text-xs text-gray-500">
                  {notice.content}
                </p>
                <div className="mt-1 text-xs text-gray-400">{notice.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 페이징 버튼 - 하단 고정 */}
      <div className="flex justify-center space-x-2 border-t border-gray-200 bg-gray-50 p-4">
        <button
          onClick={() => setEventPage(Math.max(1, eventPage - 1))}
          disabled={eventPage === 1}
          className="rounded bg-gray-300 px-4 py-2 text-base disabled:bg-gray-200 disabled:text-gray-400"
        >
          이전
        </button>
        {Array.from({ length: gridTotalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setEventPage(page)}
            className={`rounded px-4 py-2 text-base ${
              eventPage === page
                ? 'bg-teal-500 text-white'
                : 'bg-gray-300 text-gray-700'
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => setEventPage(Math.min(gridTotalPages, eventPage + 1))}
          disabled={eventPage === gridTotalPages}
          className="rounded bg-gray-300 px-4 py-2 text-base disabled:bg-gray-200 disabled:text-gray-400"
        >
          다음
        </button>
      </div>
    </div>
  );
};
