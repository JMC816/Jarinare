import backward from '@/assets/icons/backward.png';
import picture from '@/assets/icons/picture.png';

import { useNavigate } from 'react-router-dom';

const EventWirtePage = () => {
  const navigate = useNavigate();
  return (
    <div className="flex h-screen w-full flex-col">
      <div className="flex h-[60px] w-full flex-col px-4 pl-[28px] pr-[27px]">
        <img
          onClick={() => navigate(-1)}
          src={backward}
          className="mt-[30px] h-[20px] w-[12px] cursor-pointer"
        />
        <h1 className="mt-5 text-lg font-bold">이벤트 작성</h1>
        <form className="mt-10 flex flex-col gap-10">
          <input
            type="text"
            required
            placeholder="작성자"
            className="border-b border-lightGray text-base placeholder:text-lightGray focus:outline-none"
          />
          <input
            type="text"
            required
            placeholder="제목"
            className="border-b border-lightGray text-base placeholder:text-lightGray focus:outline-none"
          />
          <textarea
            required
            placeholder="내용"
            className="h-[120px] resize-none border-b border-lightGray text-base placeholder:text-lightGray focus:outline-none"
          />
          <div className="flex justify-end">
            <label
              htmlFor="file"
              className="flex items-center justify-center gap-1 rounded-md border border-lightGray bg-white p-2 active:brightness-50"
            >
              <span className="text-base text-lightGray">사진 첨부</span>
              <img src={picture} />
            </label>
            <input
              id="file"
              type="file"
              className="hidden border border-lightGray"
            />
          </div>
          <div className="flex justify-between gap-5">
            <button
              type="button"
              onClick={() => navigate('/board')}
              className="h-12 w-[200px] rounded-xs bg-lightBlue text-base font-bold text-blue active:brightness-50"
            >
              취소
            </button>
            <button className="h-12 w-[200px] rounded-xs bg-blue text-base font-bold text-white active:brightness-50">
              작성 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default EventWirtePage;
