import request from '@/assets/icons/request.png';

const RequestChangeModal = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-darkGray/50">
      <div className="flex h-[150px] w-[200px] flex-col items-center justify-center rounded-2xl bg-white font-bold text-blue">
        <img src={request} width={40} height={40} />
        <span className="mt-[25px]">자리 요청을 보냈습니다!</span>
      </div>
    </div>
  );
};

export default RequestChangeModal;
