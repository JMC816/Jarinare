import Seat from './Seat';

const SeatCheckList = () => {
  return (
    <div className="mt-[15px] h-[420px] w-[320px] rounded-lg bg-lightestGray px-5">
      <div className="flex justify-between text-lg font-bold text-black">
        <div className="flex gap-x-5">
          <span className="flex h-[40px] w-[40px] items-center justify-center">
            A
          </span>
          <span className="flex h-[40px] w-[40px] items-center justify-center">
            B
          </span>
        </div>
        <div className="flex gap-x-5">
          <span className="flex h-[40px] w-[40px] items-center justify-center">
            A
          </span>
          <span className="flex h-[40px] w-[40px] items-center justify-center">
            B
          </span>
        </div>
      </div>
      <div className="mt-[10px] flex justify-between">
        <div className="grid w-[100px] grid-cols-2 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((idx) => (
            <Seat key={idx} borderColor="lightGray" bgColor="lightesGray" />
          ))}
        </div>
        <div className="flex flex-col justify-between text-lg font-bold">
          {[6, 5, 4, 3, 2, 1].map((idx) => (
            <span
              key={idx}
              className="flex h-[40px] w-[40px] items-center justify-center gap-5"
            >
              {idx}
            </span>
          ))}
        </div>
        <div className="grid w-[100px] grid-cols-2 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((idx) => (
            <Seat key={idx} borderColor="lightGray" bgColor="lightesGray" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeatCheckList;
