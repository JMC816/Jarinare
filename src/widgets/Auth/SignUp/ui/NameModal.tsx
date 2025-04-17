import NameForm from '@/features/Auth/SignUp/ui/NameForm';
import NextButton from './NextButton';
import useModalStore from '@/widgets/model/AuthStore';
import BackWardModalButton from '@/widgets/layouts/ui/BackWardModalButton';
import SignUpStageLine from './SignUpStageLine';
import { useFormContext } from 'react-hook-form';

const NameModal = () => {
  const { closeModal } = useModalStore();
  const {
    formState: { errors },
    getValues,
  } = useFormContext();
  return (
    <div className="flex h-full w-full flex-col items-center bg-lightestGray pl-[38px] pr-[37px]">
      <BackWardModalButton closeModal={() => closeModal('NameModal')} />
      <NameForm />
      <SignUpStageLine stage={2} width={200} borderRadius="xl" />
      <NextButton
        text="다음"
        bgColor="blue"
        textColor="white"
        modalTypes={
          // 이름 에러나 빈 값일 시 다음 모달 제한
          errors.name || getValues('name') == '' ? 'NameModal' : 'PasswordModal'
        }
      />
    </div>
  );
};

export default NameModal;
