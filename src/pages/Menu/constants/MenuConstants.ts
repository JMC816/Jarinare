import on_board from '@/assets/icons/on_board.png';
import { auth } from '@/shared/firebase/firebase';
import on_user from '@/assets/icons/on_user.png';
import returned from '@/assets/icons/returned.png';
import on_key from '@/assets/icons/on_key.png';
import join from '@/assets/icons/join.png';

export const MenuConstants = () => {
  const user = auth.currentUser;
  if (user) {
    return [
      {
        text: '게시판',
        link: '/board',
        icon: on_board,
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
