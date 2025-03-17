import { AuthStageProps } from '@/shared/modals/types/Auth';

const SignUpStageLine = ({ stage }: AuthStageProps) => {
  return (
    <div className="flex w-full flex-col gap-y-[10px]">
      <span className="flex w-full justify-end text-base font-bold">
        3단계중 {stage}
      </span>
      <div className="h-[10px] rounded-xl bg-lightGray">
        {stage === '1단계' ? (
          <div className="h-[10px] w-[100px] rounded-s-xl bg-black" />
        ) : null}
        {stage === '2단계' ? (
          <div className="h-[10px] w-[200px] rounded-s-xl bg-black" />
        ) : null}
        {stage === '3단계' ? (
          <div className="h-[10px] w-[300px] rounded-xl bg-black" />
        ) : null}
      </div>
    </div>
  );
};

export default SignUpStageLine;
