/**
 * @role: widgets — PC 웰컴 투어 오버레이
 * @rule: 렌더링만 담당, createPortal로 전체 화면 오버레이
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import welcomeTourStore, { hasTourCompleted } from '@/shared/models/welcomeTourStore';

interface TourStep {
  step: number;
  page: string;
  targetId: string | null;
  extraTargetId?: string; // union rect로 스포트라이트 확장
  spotlightPadding?: number; // 스텝별 패딩 오버라이드
  offsetY?: number; // 스포트라이트 세로 오프셋 (음수 = 위로)
  title: string;
  desc: string;
  bubblePos: 'bottom' | 'top' | 'left' | 'center';
  nextRoute: string | null;
}

const STEPS: TourStep[] = [
  {
    step: 1,
    page: 'home',
    targetId: 'tour-search',
    title: '1단계 · 열차 검색',
    desc: '출발역·도착역·날짜·인원을 선택한 뒤 검색 버튼을 누르세요.',
    bubblePos: 'bottom',
    nextRoute: '/reserve/traincheck',
  },
  {
    step: 2,
    page: 'traincheck',
    targetId: 'tour-train-filter',
    spotlightPadding: 48,
    offsetY: -20,
    title: '2단계 · 날짜·종류·시간대 선택',
    desc: '날짜·기차 종류·시간대를 설정하세요.',
    bubblePos: 'bottom',
    nextRoute: null,
  },
  {
    step: 3,
    page: 'traincheck',
    targetId: 'tour-train-list',
    title: '3단계 · 기차 조회',
    desc: '조건에 맞는 열차 목록에서 원하는 열차를 선택하세요.',
    bubblePos: 'top',
    nextRoute: '/reserve/seatcheck',
  },
  {
    step: 4,
    page: 'seatcheck',
    targetId: 'tour-seat',
    extraTargetId: 'tour-seat-bottom',
    offsetY: -20,
    title: '4단계 · 좌석 선택',
    desc: '호차를 선택하고 원하는 좌석을 고르거나 자동 배정받으세요.',
    bubblePos: 'left',
    nextRoute: null,
  },
  {
    step: 5,
    page: 'seatcheck',
    targetId: 'tour-pay-modal',
    title: '5단계 · 결제',
    desc: '이벤트 할인과 포인트를 적용하고 결제를 완료하면 예매 완료!',
    bubblePos: 'left',
    nextRoute: '/',
  },
];

const PADDING = 24;

interface Props {
  page: string;
  onNextAction?: () => void; // 다음 버튼 클릭 시 추가 동작 (결제 모달 열기 등)
}

const PCWelcomeTour = ({ page, onNextAction }: Props) => {
  const { isActive, step, nextStep, skipTour, startTour } = welcomeTourStore();
  const [spotlightRect, setSpotlightRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const [visible, setVisible] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const currentStep = STEPS.find((s) => s.step === step);
  const isMyPage = currentStep?.page === page;

  const handleNext = () => {
    const next = currentStep?.nextRoute;
    const isLast = step === 5;

    // 같은 페이지 내 스텝 전환 — 페이드아웃 후 nextStep
    if (!next && !onNextAction) {
      setVisible(false);
      setTimeout(() => nextStep(), 280);
      return;
    }

    nextStep();
    if (next) navigate(next);
    if (onNextAction && !isLast) onNextAction();
  };

  // 첫 방문 시 자동 시작 — localStorage를 직접 읽어 hydration 타이밍 문제 방지
  useEffect(() => {
    if (page === 'home' && !hasTourCompleted()) {
      startTour();
    }
  }, []);

  // 타겟 요소 위치 측정 (extraTargetId가 있으면 union rect)
  useLayoutEffect(() => {
    if (!isActive || !isMyPage || !currentStep?.targetId) {
      setSpotlightRect(null);
      return;
    }

    const pad = currentStep.spotlightPadding ?? PADDING;

    const measure = () => {
      const el = document.getElementById(currentStep.targetId!);
      if (!el) return;

      const r = el.getBoundingClientRect();
      let top = r.top;
      let left = r.left;
      let right = r.right;
      let bottom = r.bottom;

      if (currentStep.extraTargetId) {
        const el2 = document.getElementById(currentStep.extraTargetId);
        if (el2) {
          const r2 = el2.getBoundingClientRect();
          top = Math.min(top, r2.top);
          left = Math.min(left, r2.left);
          right = Math.max(right, r2.right);
          bottom = Math.max(bottom, r2.bottom);
        }
      }

      const oy = currentStep.offsetY ?? 0;
      setSpotlightRect({
        top: top - pad + oy,
        left: left - pad,
        width: right - left + pad * 2,
        height: bottom - top + pad * 2,
      });
    };

    measure();

    const ro = new ResizeObserver(measure);
    const el = document.getElementById(currentStep.targetId!);
    if (el) ro.observe(el);
    if (currentStep.extraTargetId) {
      const el2 = document.getElementById(currentStep.extraTargetId);
      if (el2) ro.observe(el2);
    }
    window.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);

    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', measure, true);
      window.removeEventListener('resize', measure);
    };
  }, [isActive, step, isMyPage]);

  // 페이드인
  useEffect(() => {
    if (isActive && isMyPage) {
      const t = setTimeout(() => setVisible(true), 50);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [isActive, step, isMyPage]);

  if (!isActive || !isMyPage) return null;

  // 말풍선 위치 계산
  const getBubbleStyle = (): React.CSSProperties => {
    if (currentStep?.bubblePos === 'center' || !spotlightRect) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
    if (currentStep?.bubblePos === 'bottom') {
      return {
        top: spotlightRect.top + spotlightRect.height + 20,
        left: spotlightRect.left + spotlightRect.width / 2,
        transform: 'translateX(-50%)',
      };
    }
    if (currentStep?.bubblePos === 'top') {
      return {
        bottom: window.innerHeight - spotlightRect.top + 20,
        left: spotlightRect.left + spotlightRect.width / 2,
        transform: 'translateX(-50%)',
      };
    }
    // left — 스포트라이트 왼쪽에 말풍선 배치
    return {
      top: spotlightRect.top + spotlightRect.height / 2,
      left: spotlightRect.left - 20,
      transform: 'translate(-100%, -50%)',
    };
  };

  const arrowDir = currentStep?.bubblePos;

  return createPortal(
    <div
      className="fixed inset-0 z-[500]"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease' }}
    >
      {/* 스포트라이트: box-shadow가 나머지를 어둡게 */}
      {spotlightRect ? (
        <div
          className="pointer-events-none fixed rounded-2xl"
          style={{
            top: spotlightRect.top,
            left: spotlightRect.left,
            width: spotlightRect.width,
            height: spotlightRect.height,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.65)',
            zIndex: 1,
          }}
        />
      ) : (
        <div className="pointer-events-none fixed inset-0 bg-black/65" style={{ zIndex: 1 }} />
      )}

      {/* 말풍선 */}
      <div
        ref={bubbleRef}
        className="fixed z-[2] w-96 max-w-[90vw] rounded-2xl bg-white p-6 shadow-2xl"
        style={getBubbleStyle()}
      >
        {/* 화살표 */}
        {arrowDir === 'bottom' && spotlightRect && (
          <div
            className="absolute -top-2.5 left-1/2 -translate-x-1/2 border-x-8 border-b-[10px] border-x-transparent border-b-white"
          />
        )}
        {arrowDir === 'top' && spotlightRect && (
          <div
            className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 border-x-8 border-t-[10px] border-x-transparent border-t-white"
          />
        )}
        {arrowDir === 'left' && spotlightRect && (
          <div
            className="absolute right-[-10px] top-1/2 -translate-y-1/2 border-y-8 border-l-[10px] border-y-transparent border-l-white"
          />
        )}

        {/* 스텝 인디케이터 */}
        <div className="mb-3 flex items-center gap-1.5">
          {STEPS.map((s) => (
            <div
              key={s.step}
              className={`h-1.5 rounded-full transition-all ${
                s.step === step ? 'w-5 bg-blue' : 'w-1.5 bg-gray-200'
              }`}
            />
          ))}
        </div>

        <p className="mb-0.5 text-base font-black text-gray-900">{currentStep?.title}</p>
        <p className="mb-4 text-sm leading-relaxed text-gray-500">{currentStep?.desc}</p>

        <div className="flex items-center justify-between">
          <button
            onClick={skipTour}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            건너뛰기
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 rounded-lg bg-blue px-4 py-2 text-sm font-bold text-white hover:bg-blue/90"
          >
            {step === 5 ? '시작하기' : '다음'}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default PCWelcomeTour;
