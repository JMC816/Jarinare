import LoginButton from '@/shared/ui/LoginButton';
import { SocialLoginArray } from '@/widgets/Auth/Login/consts/SocialLogin';

const SocialLoginList = () => {
  return (
    <div className="flex flex-col gap-y-2">
      {SocialLoginArray.map(({ text, bgColor, textColor, icon }, idx) => (
        <LoginButton
          key={idx}
          text={text}
          bgColor={bgColor}
          textColor={textColor}
          icon={icon}
        />
      ))}
    </div>
  );
};

export default SocialLoginList;
