import change from '@/assets/icons/change.png';

const AcceptModal = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-darkGray/50">
      <div className="flex h-[150px] w-[200px] flex-col items-center justify-center rounded-2xl bg-white font-bold text-blue">
        <div className="relative h-[40px] w-[40px] rounded-full border-4 border-blue text-base">
          <img
            src={change}
            width={26}
            height={16}
            className="absolute right-0.5 top-2"
          />
        </div>
        <span className="mt-[25px]">자리 요청을 보냈습니다!</span>
      </div>
    </div>
  );
};

export default AcceptModal;
