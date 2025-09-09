import { auth } from '@/shared/firebase/firebase';

export const MenuConstants = () => {
  const user = auth.currentUser;
  if (user) {
    return [
      {
        text: '승차권 반환',
        link: '/returnlist',
      },
      {
        text: '마이페이지',
        link: '/mypage',
      },
    ];
  } else {
    return [
      {
        text: '로그인',
        link: '/auth/login',
      },
      {
        text: '회원가입',
        link: '/auth/signup',
      },
      {
        text: '승차권 반환',
        link: '/returnlist',
      },
      {
        text: '마이페이지',
        link: '/mypage',
      },
    ];
  }
};
