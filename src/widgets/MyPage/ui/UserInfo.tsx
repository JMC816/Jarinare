import { auth } from '@/shared/firebase/firebase';
import { useNavigation } from '../types/useNavigation';

const UserInfo = () => {
  const user = auth.currentUser;
  const { navigation } = useNavigation();
  if (!user) return;
  return (
    <div className="flex flex-col gap-y-[25px] text-base text-darkGray">
      <div className="flex justify-between">
        <span>이름</span>
        <span>{user.displayName ? user?.displayName : user.uid}</span>
      </div>
      <div className="flex justify-between">
        <span>회원번호</span>
        <span>20251234</span>
      </div>
      <span
        onClick={() => {
          auth.signOut();
          navigation('/auth/login');
        }}
        className="w-full text-center underline"
      >
        로그아웃
      </span>
    </div>
  );
};
export default UserInfo;
