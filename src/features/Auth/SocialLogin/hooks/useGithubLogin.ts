import { auth } from '@/shared/firebase/firebase';
import { GithubAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export const useGithubLogin = () => {
  const navigate = useNavigate();
  const onClick = async () => {
    try {
      // 깃허브 인증 제공자 생성
      const provieder = new GithubAuthProvider();
      // 깃허브 로그인(팝업)
      await signInWithPopup(auth, provieder);
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };
  return { onClick };
};
