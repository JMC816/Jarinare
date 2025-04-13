import { AuthStageProps } from '../../types/AuthType';
import { motion } from 'framer-motion';

const SignUpStageLine = ({ stage, width, borderRadius }: AuthStageProps) => {
  return (
    <div className="mb-[20px] flex w-full flex-col gap-y-[10px]">
      <span className="flex w-full justify-end text-base font-bold">
        3단계중 {stage}단계
      </span>
      <div className="h-[10px] w-[300px] rounded-xl bg-lightGray">
        <motion.div
          layoutId="signup"
          initial={{ width }}
          animate={{ width }}
          transition={{ duration: 0.5 }}
          className={`h-[10px] rounded-${borderRadius} bg-black`}
        />
      </div>
    </div>
  );
};
export default SignUpStageLine;
