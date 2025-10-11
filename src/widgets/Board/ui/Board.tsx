import { useState } from 'react';

const boardData = [
  {
    id: '1',
    title: '승차권 예약 문의드립니다',
    author: '김철수',
    date: '2024.01.12',
    views: 15,
    likes: 3,
  },
  {
    id: '2',
    title: '좌석 변경 방법이 궁금합니다',
    author: '이영희',
    date: '2024.01.11',
    views: 8,
    likes: 1,
  },
  {
    id: '3',
    title: '환불 정책에 대해 문의',
    author: '박민수',
    date: '2024.01.10',
    views: 22,
    likes: 5,
  },
  {
    id: '4',
    title: '앱 사용법 가이드',
    author: '정수진',
    date: '2024.01.09',
    views: 45,
    likes: 12,
  },
  {
    id: '5',
    title: '기차 시간표 변경 안내',
    author: '최민호',
    date: '2024.01.08',
    views: 33,
    likes: 7,
  },
  {
    id: '6',
    title: '할인 혜택 문의',
    author: '강지영',
    date: '2024.01.07',
    views: 19,
    likes: 4,
  },
  {
    id: '7',
    title: '모바일 앱 오류 신고',
    author: '윤서준',
    date: '2024.01.06',
    views: 28,
    likes: 6,
  },
  {
    id: '8',
    title: '승차권 양도 가능한가요?',
    author: '임하늘',
    date: '2024.01.05',
    views: 41,
    likes: 9,
  },
  {
    id: '9',
    title: '대기열 시스템 개선 제안',
    author: '송민지',
    date: '2024.01.04',
    views: 52,
    likes: 15,
  },
  {
    id: '10',
    title: '결제 오류 해결 방법',
    author: '정현우',
    date: '2024.01.03',
    views: 37,
    likes: 8,
  },
  {
    id: '11',
    title: '예매 취소 수수료 문의',
    author: '김나연',
    date: '2024.01.02',
    views: 24,
    likes: 3,
  },
  {
    id: '12',
    title: '회원가입 인증 문제',
    author: '박준혁',
    date: '2024.01.01',
    views: 31,
    likes: 5,
  },
];

export const Board = () => {
  const [boardPage, setBoardPage] = useState(1);

  const boardItemsPerPage = 8; // 자유게시판 페이지당 아이템 수

  // 자유게시판 페이징 계산
  const boardTotalPages = Math.ceil(boardData.length / boardItemsPerPage);
  const boardStartIndex = (boardPage - 1) * boardItemsPerPage;
  const boardEndIndex = boardStartIndex + boardItemsPerPage;
  const currentBoardPosts = boardData.slice(boardStartIndex, boardEndIndex);
  return (
    <div className="space-y-2">
      {currentBoardPosts.map((post) => (
        <div key={post.id} className="rounded-lg bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-500">{post.author}</span>
            <span className="text-sm text-gray-500">{post.date}</span>
          </div>
          <h3 className="mb-2 text-base font-bold text-gray-900">
            {post.title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>조회 {post.views}</span>
            <span>좋아요 {post.likes}</span>
          </div>
        </div>
      ))}

      {/* 자유게시판 페이징 버튼 */}
      <div className="flex justify-center space-x-2 pt-4">
        <button
          onClick={() => setBoardPage(Math.max(1, boardPage - 1))}
          disabled={boardPage === 1}
          className="rounded bg-gray-300 px-4 py-2 text-base disabled:bg-gray-200 disabled:text-gray-400"
        >
          이전
        </button>
        {Array.from({ length: boardTotalPages }, (_, i) => i + 1).map(
          (page) => (
            <button
              key={page}
              onClick={() => setBoardPage(page)}
              className={`rounded px-4 py-2 text-base ${
                boardPage === page
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-300 text-gray-700'
              }`}
            >
              {page}
            </button>
          ),
        )}
        <button
          onClick={() => setBoardPage(Math.min(boardTotalPages, boardPage + 1))}
          disabled={boardPage === boardTotalPages}
          className="rounded bg-gray-300 px-4 py-2 text-base disabled:bg-gray-200 disabled:text-gray-400"
        >
          다음
        </button>
      </div>
    </div>
  );
};
