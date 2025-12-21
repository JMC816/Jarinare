import { auth } from '@/shared/firebase/firebase';
import { useNavigation } from '../types/useNavigation';
import useModalStore from '@/widgets/model/AuthStore';

const UserInfo = () => {
  const user = auth.currentUser;
  const { navigation } = useNavigation();
  const { resetModal } = useModalStore();

  if (!user) return;

  const handleLogout = () => {
    auth.signOut();
    resetModal(); // 모달 상태 초기화
    navigation('/'); // 메인페이지로 이동
  };

  return (
    <div className="flex flex-col gap-y-[25px] text-base text-darkGray">
      <div className="flex justify-between">
        <span>이름</span>
        <span>{user.displayName ? user?.displayName : user.uid}</span>
      </div>
      {/* <div className="flex justify-between">
        <span>회원번호</span>
        <span>20251234</span>
      </div> */}
      <span onClick={handleLogout} className="w-full text-center underline">
        로그아웃
      </span>
    </div>
  );
};
export default UserInfo;
