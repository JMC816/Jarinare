import off_home from '@/assets/icons/off_home.png';
import off_key from '@/assets/icons/off_key.png';
import off_person from '@/assets/icons/off_person.png';
import person from '@/assets/icons/person.png';
import off_menu from '@/assets/icons/off_menu.png';
import on_home from '@/assets/icons/on_home.png';
import on_key from '@/assets/icons/on_key.png';
import on_menu from '@/assets/icons/on_menu.png';
import { auth } from '@/shared/firebase/firebase';

export const NavBarConstants = () => {
  const user = auth.currentUser;
  if (user) {
    return [
      {
        on_icon: on_home,
        off_icon: off_home,
        text: '홈',
        path: '/',
      },
      {
        on_icon: person,
        off_icon: off_person,
        text: '마이',
        path: '/mypage',
      },
      {
        on_icon: on_menu,
        off_icon: off_menu,
        text: '메뉴',
        path: '/menu',
      },
    ];
  } else {
    return [
      {
        on_icon: on_home,
        off_icon: off_home,
        text: '홈',
        path: '/',
      },
      {
        on_icon: on_key,
        off_icon: off_key,
        text: '로그인',
        path: '/auth/login',
      },
      {
        on_icon: on_menu,
        off_icon: off_menu,
        text: '메뉴',
        path: '/menu',
      },
    ];
  }
};
