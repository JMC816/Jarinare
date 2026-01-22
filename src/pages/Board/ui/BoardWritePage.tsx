import backward from '@/assets/icons/backward.png';
import BoardForm from '@/widgets/Board/ui/BoardForm';

import { useNavigate } from 'react-router-dom';

const BoardWirtePage = () => {
  const navigate = useNavigate();
  return (
    <div className="flex h-screen w-full flex-col">
      <div className="flex h-[60px] w-full flex-col px-4 pl-[28px] pr-[27px]">
        <img
          onClick={() => navigate(-1)}
          src={backward}
          className="mt-[30px] h-[20px] w-[12px] cursor-pointer"
        />
        <h1 className="mt-5 text-lg font-bold">자유게시판 작성</h1>
        <BoardForm />
      </div>
    </div>
  );
};
export default BoardWirtePage;
