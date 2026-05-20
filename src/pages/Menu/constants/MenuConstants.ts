import on_board from '@/assets/icons/on_board.png';
import { auth } from '@/shared/firebase/firebase';
import on_user from '@/assets/icons/on_user.png';
import returned from '@/assets/icons/returned.png';
import on_key from '@/assets/icons/on_key.png';
import join from '@/assets/icons/join.png';

export type MenuItem = {
  text: string;
  icon: string;
  link?: string;
  subItems?: { text: string; link: string }[];
};

export const BOARD_SUB_ITEMS = [
  { text: '공지사항', link: '/board/noticelist' },
  { text: '이벤트', link: '/board/eventlist' },
  { text: '자유게시판', link: '/board/boardlist' },
  { text: '여행지 후기', link: '/travel/review/list' },
];

export const MenuConstants = (): MenuItem[] => {
  const user = auth.currentUser;
  if (user) {
    return [
      {
        text: '마이페이지',
        link: '/mypage',
        icon: on_user,
      },
      {
        text: '승차권 반환',
        link: '/returnlist',
        icon: returned,
      },
      {
        text: '게시판',
        icon: on_board,
        subItems: BOARD_SUB_ITEMS,
      },
    ];
  } else {
    return [
      {
        text: '로그인',
        link: '/auth/login',
        icon: on_key,
      },
      {
        text: '회원가입',
        link: '/auth/signup',
        icon: join,
      },
      {
        text: '승차권 반환',
        link: '/returnlist',
        icon: returned,
      },
      {
        text: '마이페이지',
        link: '/mypage',
        icon: on_user,
      },
    ];
  }
};
