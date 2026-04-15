import { AuthStageProps } from '../../types/AuthType';
import { motion } from 'framer-motion';

const TOTAL_WIDTH = 300;

const LoginStageLine = ({ width }: AuthStageProps) => {
  const percent = Math.round((width / TOTAL_WIDTH) * 100);

  return (
    <div className="mb-[20px] flex w-full flex-col gap-y-[8px]">
      <div className="flex w-full items-center justify-between">
        <span className="text-xs text-gray-300">기본 정보</span>
        <span className="text-xs font-bold text-blue">{percent}%</span>
      </div>
      <div className="h-[4px] w-[300px] rounded-full bg-lightGray">
        <motion.div
          layoutId="login"
          initial={{ width }}
          animate={{ width }}
          transition={{ duration: 0.5 }}
          className="h-[4px] rounded-full bg-blue"
        />
      </div>
    </div>
  );
};
export default LoginStageLine;
