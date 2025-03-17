import { AuthStageProps } from '@/shared/modals/types/Auth';

const LoginStageLine = ({ stage }: AuthStageProps) => {
  return (
    <div className="flex w-full flex-col gap-y-[10px]">
      <span className="flex w-full justify-end text-base font-bold">
        2단계중 {stage}
      </span>
      <div className="h-[10px] rounded-xl bg-lightGray">
        {stage === '2단계' ? (
          <div className="h-[10px] w-[300px] rounded-xl bg-black" />
        ) : (
          <div className="h-[10px] w-[150px] rounded-s-xl bg-black" />
        )}
      </div>
    </div>
  );
};

export default LoginStageLine;
