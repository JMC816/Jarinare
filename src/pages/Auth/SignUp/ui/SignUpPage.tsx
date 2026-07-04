import { SignUp } from '@/features/Auth/SignUp/model/SignUpSchema';
import EmailForm from '@/features/Auth/SignUp/ui/EmailForm';
import SelectAge from '@/features/Auth/SignUp/ui/SelectAge';
import Modal from '@/widgets/Auth/SignUp/ui/Modal';
import SignUpStageLine from '@/widgets/Auth/SignUp/ui/SignUpStageLine';
import BackWardPageButton from '@/widgets/layouts/ui/BackWardPageButton';
import useModalStore from '@/widgets/model/AuthStore';
import { FormProvider } from 'react-hook-form';
import { useSignUpState } from '@/features/Auth/SignUp/hooks/useSignUpState';
import { useSignUpPage } from '../hooks/useSignUpPage';
import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const BackIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const SignUpPage = () => {
  const { isShow, modalType, openModal, resetModal } = useModalStore();
  const { method: pcMethod } = SignUp();
  const { method: mobileMethod } = SignUp();
  const { onSubmit, isLoading } = useSignUpState();
  const navigate = useNavigate();
  const {
    pcHandleNextClick,
    mobileHandleNextClick,
    isChecking,
    isCapsLockOn,
    setIsCapsLockOn,
  } = useSignUpPage(pcMethod, mobileMethod);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isChecking) pcHandleNextClick();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isChecking, pcHandleNextClick]);

  useEffect(() => {
    resetModal();
  }, []);

  const pcErrors = pcMethod.formState.errors;

  const pcModalContent = () => {
    /* Step 2 — 이름 */
    if (isShow && modalType === 'NameModal')
      return (
        <div
          key="step-name"
          className="flex h-full w-full flex-col justify-between px-10 pb-10"
        >
          <div>
            <div className="mt-8 flex w-full items-center">
              <button
                type="button"
                onClick={() => resetModal()}
                className="flex items-center gap-1 text-sm font-medium text-black hover:text-gray-600"
              >
                <BackIcon />
                회원가입
              </button>
              <span className="ml-auto rounded-full bg-blue/10 px-3 py-1 text-xs font-medium text-blue">
                Step 2 of 4
              </span>
            </div>
            <div className="mt-6 flex flex-col gap-1">
              <h2 className="text-2xl font-bold text-gray-900">이름</h2>
              <p className="text-sm text-gray-400">실명을 입력해주세요</p>
            </div>
            <div className="mt-8 flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-gray-700">이름</span>
              <input
                {...pcMethod.register('name')}
                type="text"
                placeholder="이름을 입력하세요"
                autoComplete="off"
                className="h-12 w-full rounded-lg border border-gray-200 px-4 text-sm text-gray-800 focus:border-blue focus:outline-none"
              />
              {pcErrors.name && (
                <span className="text-xs text-red">
                  {String(pcErrors.name.message)}
                </span>
              )}
            </div>
          </div>
          <div>
            <SignUpStageLine stage={2} />
            <button
              type="button"
              onClick={() => {
                if (!pcErrors.name && pcMethod.getValues('name') !== '')
                  openModal('AgeModal');
              }}
              className="relative flex h-12 w-full items-center justify-center rounded-md border border-lightGray bg-blue text-base font-bold text-white shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95"
            >
              다음
            </button>
          </div>
        </div>
      );

    /* Step 3 — 성별/나이대 */
    if (isShow && modalType === 'AgeModal')
      return (
        <div
          key="step-age"
          className="flex h-full w-full flex-col justify-between px-10 pb-10"
        >
          <div>
            <div className="mt-8 flex w-full items-center">
              <button
                type="button"
                onClick={() => openModal('NameModal')}
                className="flex items-center gap-1 text-sm font-medium text-black hover:text-gray-600"
              >
                <BackIcon />
                회원가입
              </button>
              <span className="ml-auto rounded-full bg-blue/10 px-3 py-1 text-xs font-medium text-blue">
                Step 3 of 4
              </span>
            </div>
            <div className="mt-6 flex flex-col gap-1">
              <h2 className="text-2xl font-bold text-gray-900">추가 정보</h2>
              <p className="text-sm text-gray-400">
                맞춤 서비스를 위한 정보예요
              </p>
            </div>
            <div className="mt-8">
              <SelectAge />
            </div>
          </div>
          <div>
            <SignUpStageLine stage={3} />
            <button
              type="button"
              onClick={() => {
                if (!pcErrors.name && pcMethod.getValues('name') !== '')
                  openModal('PasswordModal');
              }}
              className="relative flex h-12 w-full items-center justify-center rounded-md border border-lightGray bg-blue text-base font-bold text-white shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95"
            >
              다음
            </button>
          </div>
        </div>
      );

    /* Step 4 — 비밀번호 */
    if (isShow && modalType === 'PasswordModal')
      return (
        <form
          key="step-password"
          onSubmit={pcMethod.handleSubmit(async (data) => {
            await onSubmit(data);
          })}
          className="flex h-full w-full flex-col justify-between px-10 pb-10"
        >
          <div>
            <div className="mt-8 flex w-full items-center">
              <button
                type="button"
                onClick={() => openModal('AgeModal')}
                className="flex items-center gap-1 text-sm font-medium text-black hover:text-gray-600"
              >
                <BackIcon />
                회원가입
              </button>
              <span className="ml-auto rounded-full bg-blue/10 px-3 py-1 text-xs font-medium text-blue">
                Step 4 of 4
              </span>
            </div>
            <div className="mt-6 flex flex-col gap-1">
              <h2 className="text-2xl font-bold text-gray-900">비밀번호</h2>
              <p className="text-sm text-gray-400">
                안전한 비밀번호를 설정해주세요
              </p>
            </div>
            <div
              className="mt-8 flex flex-col gap-4"
              onKeyDown={(e) => setIsCapsLockOn(e.getModifierState('CapsLock'))}
              onKeyUp={(e) => setIsCapsLockOn(e.getModifierState('CapsLock'))}
            >
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-gray-700">
                  비밀번호
                </span>
                <input
                  {...pcMethod.register('password')}
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  autoComplete="off"
                  className="h-12 w-full rounded-lg border border-gray-200 px-4 text-sm text-gray-800 focus:border-blue focus:outline-none"
                />
                {pcErrors.password && (
                  <span className="text-xs text-red">
                    {String(pcErrors.password.message)}
                  </span>
                )}
                {isCapsLockOn && (
                  <span className="text-xs text-orange-500">
                    ⚠️ Caps Lock이 켜져 있습니다.
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-gray-700">
                  비밀번호 확인
                </span>
                <input
                  {...pcMethod.register('confirmPassword')}
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  autoComplete="off"
                  className="h-12 w-full rounded-lg border border-gray-200 px-4 text-sm text-gray-800 focus:border-blue focus:outline-none"
                />
                {pcErrors.confirmPassword && (
                  <span className="text-xs text-red">
                    {String(pcErrors.confirmPassword.message)}
                  </span>
                )}
                <span className="text-xs text-gray-400">
                  영문 · 숫자 · 특수문자 포함 8자 이상
                </span>
              </div>
            </div>
          </div>
          <div>
            <SignUpStageLine stage={4} />
            <button
              type="submit"
              disabled={isLoading}
              className="relative flex h-12 w-full items-center justify-center rounded-md border border-lightGray bg-blue text-base font-bold text-white shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95 disabled:opacity-60"
            >
              {isLoading ? '회원가입 중...' : '회원가입 완료'}
            </button>
          </div>
        </form>
      );

    /* Step 1 — 이메일 (기본) */
    return (
      <div
        key="step-email"
        className="flex h-full w-full flex-col justify-between px-10 pb-10"
      >
        <div>
          <div className="mt-8 flex w-full items-center">
            <button
              type="button"
              onClick={() => navigate('/auth/login')}
              className="flex items-center gap-1 text-sm font-medium text-black hover:text-gray-600"
            >
              <BackIcon />
              회원가입
            </button>
            <span className="ml-auto rounded-full bg-blue/10 px-3 py-1 text-xs font-medium text-blue">
              Step 1 of 4
            </span>
          </div>
          <div className="mt-6 flex flex-col gap-1">
            <h2 className="text-2xl font-bold text-gray-900">이메일</h2>
            <p className="text-sm text-gray-400">
              회원가입에 사용할 이메일을 입력해주세요
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-gray-700">이메일</span>
            <input
              {...pcMethod.register('email')}
              type="email"
              placeholder="이메일을 입력하세요"
              autoComplete="off"
              className="h-12 w-full rounded-lg border border-gray-200 px-4 text-sm text-gray-800 focus:border-blue focus:outline-none"
            />
            {pcErrors.email && (
              <span className="text-xs text-red">
                {String(pcErrors.email.message)}
              </span>
            )}
          </div>
        </div>
        <div>
          <SignUpStageLine stage={1} />
          <button
            type="button"
            onClick={pcHandleNextClick}
            disabled={isChecking}
            className="relative flex h-12 w-full items-center justify-center rounded-md border border-lightGray bg-blue text-base font-bold text-white shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95 disabled:bg-lightBlueImpossible disabled:opacity-50"
          >
            {isChecking ? '확인 중...' : '다음'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* PC 버전 */}
      <FormProvider {...pcMethod}>
        <div
          className="hidden h-screen w-full lg:grid"
          style={{ gridTemplateColumns: '1fr 3fr' }}
        >
          {/* 왼쪽 패널 */}
          <div
            className="relative flex flex-col justify-between overflow-hidden p-8 text-white"
            style={{
              background:
                'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #60a5fa 100%)',
            }}
          >
            {/* 오른쪽 위 큰 구 */}
            <div className="absolute -right-28 -top-28 h-[420px] w-[420px] rounded-full bg-white/10" />
            {/* 왼쪽 아래 작은 구 */}
            <div className="absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-white/10" />
            <Link
              to="/"
              className="text-2xl font-semibold tracking-[0.1em] text-white transition-opacity hover:opacity-80"
            >
              JARINARE
            </Link>
            <div className="flex flex-col gap-8">
              <div className="flex flex-col">
                <p className="mb-3 text-xs font-semibold tracking-[0.15em] text-white/50">
                  HIGH-SPEED RAIL
                </p>
                <h2 className="text-5xl font-semibold leading-snug">
                  빠르고 편안한
                  <br />
                  기차 여행의 시작
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/50">
                  전국 어디든 한번의 예매, 좌석 선택부터 실시간 운행 정보까지,
                  JARINARE와 함께하세요
                </p>
              </div>
              <div className="flex flex-row gap-6">
                {[
                  { big: '120+', small: '운행노선' },
                  { big: '98%', small: '정시 도착률' },
                  { big: '24H', small: '고객 지원' },
                ].map(({ big, small }) => (
                  <div key={small}>
                    <p className="text-3xl font-semibold">{big}</p>
                    <p className="text-sm text-white/50">{small}</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-sm text-white/50">
              © 2026 JARINARE ALL rights reserved
            </p>
          </div>

          {/* 오른쪽 패널 */}
          <div className="flex items-center justify-center bg-gray-50">
            <div className="h-[620px] w-[520px]">{pcModalContent()}</div>
          </div>
        </div>
      </FormProvider>

      {/* 모바일 버전 */}
      <FormProvider {...mobileMethod}>
        <div className="flex h-screen w-full items-center justify-center lg:hidden">
          <div className="flex h-[667px] w-[375px] flex-col items-center bg-lightestGray pl-[38px] pr-[37px]">
            <BackWardPageButton title="회원가입" step="Step 1 of 4" />
            <EmailForm />
            <SignUpStageLine stage={1} />
            <div className="mb-[45px] flex flex-col">
              <button
                type="button"
                onClick={mobileHandleNextClick}
                disabled={isChecking}
                className="relative flex h-12 w-[300px] items-center justify-center rounded-md border border-lightGray bg-blue text-base font-bold text-white shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95 disabled:bg-lightBlueImpossible disabled:opacity-50"
              >
                {isChecking ? '확인 중...' : '다음'}
              </button>
            </div>
            {isShow == false || modalType == undefined ? null : <Modal />}
          </div>
        </div>
      </FormProvider>
    </>
  );
};

export default SignUpPage;
