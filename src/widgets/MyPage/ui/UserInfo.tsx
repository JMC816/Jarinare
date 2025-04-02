import { UserInfoProps } from '../types/MyPageType';

const UserInfo = ({ name, userNumber }: UserInfoProps) => {
  return (
    <div className="flex flex-col gap-y-[25px] text-base text-darkGray">
      <div className="flex justify-between">
        <span>이름</span>
        <span>{name}</span>
      </div>
      <div className="flex justify-between">
        <span>회원번호</span>
        <span>{userNumber}</span>
      </div>
    </div>
  );
};
export default UserInfo;
