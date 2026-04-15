import NextButton from './NextButton';
import useModalStore from '@/widgets/model/AuthStore';
import BackWardModalButton from '@/widgets/layouts/ui/BackWardModalButton';
import SignUpStageLine from './SignUpStageLine';
import { useFormContext } from 'react-hook-form';
import SelectAge from '@/features/Auth/SignUp/ui/SelectAge';

const AgeModal = () => {
  const { closeModal, openModal } = useModalStore();
  const {
    formState: { errors },
    getValues,
  } = useFormContext();
  return (
    <div className="flex h-full w-full flex-col items-center bg-lightestGray pl-[38px] pr-[37px]">
      <BackWardModalButton
        openModal={() => openModal('NameModal')}
        closeModal={() => closeModal('AgeModal')}
        title="회원가입"
        step="Step 3 of 4"
      />
      <SelectAge />
      <SignUpStageLine stage={3} width={225} borderRadius="xl" />
      <NextButton
        text="다음"
        bgColor="blue"
        textColor="white"
        modalTypes={
          // 이름 에러나 빈 값일 시 다음 모달 제한
          errors.name || getValues('name') == '' ? 'AgeModal' : 'PasswordModal'
        }
      />
    </div>
  );
};

export default AgeModal;
