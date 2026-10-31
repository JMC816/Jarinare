/**
 * @role: widgets/TicketReturn — ui
 * @rule: 렌더링만 담당, 비즈니스 로직 포함 금지
 */
import { useMiniTicket } from '../hooks/useMiniTicket';
import type { MiniTicketProps } from '../types/TicketReturnType';
import { seatsReturnDataStore } from '@/features/TicketReturn/model/seatsReturnDataStore';
import useModalStore from '@/widgets/model/TicketReturnStore';
import Modal from './Modal';

const MiniTicket = ({ onReturnPC }: MiniTicketProps = {}) => {
  const { tickets } = useMiniTicket();
  const { setSeatsReturnData } = seatsReturnDataStore();
  const { openModal, isShow, modalType } = useModalStore();

  if (tickets.length === 0) {
    return (
      <div className="flex h-[100px] w-full flex-col items-center justify-center rounded-xl bg-white shadow-sm">
        <span>🗒️</span>
        <span className="text-tiny font-bold">아직 예매한 승차권이 없어요</span>
      </div>
    );
  }

  /* PC 레이아웃 (onReturnPC prop 있을 때) */
  if (onReturnPC) {
    return (
      <>
        {tickets.map(({ ticket, groups, trainTypeName, startLabel, endLabel, duration }, idx) => (
          <div key={idx} className="flex w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            {/* 왼쪽 메인 영역 */}
            <div className="flex flex-1 items-center gap-6 p-5">
              {/* 메타 정보 */}
              <div className="flex w-36 shrink-0 flex-col gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="rounded-md bg-lightBlue px-2 py-0.5 text-xs font-bold text-blue">{trainTypeName}</span>
                  <span className="rounded-md bg-lightBlue px-2 py-0.5 text-xs font-bold text-blue">예약완료</span>
                </div>
                <span className="text-xs font-semibold text-gray-400">{ticket.startDayForView}</span>
                <span className="text-xs font-semibold text-gray-700">
                  {ticket.selectAdult > 0 && `어른 ${ticket.selectAdult}명`}
                  {ticket.selectAdult > 0 && ticket.selectKid > 0 && ' · '}
                  {ticket.selectKid > 0 && `어린이 ${ticket.selectKid}명`}
                </span>
              </div>
              <div className="self-stretch border-l border-gray-200" />
              {/* 여정 */}
              <div className="flex flex-1 items-center gap-4">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-2xl font-bold text-gray-900">{startLabel}</span>
                  <span className="text-base font-semibold text-gray-500">{ticket.startStationForView}</span>
                </div>
                <div className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full items-center">
                    <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue" />
                    <div className="flex-1 border-t border-dashed border-gray-300" />
                    <svg className="mx-2 shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="3" width="16" height="14" rx="3" />
                      <path d="M4 11h16M8 3v8M16 3v8M7 17l-2 3M17 17l2 3M6 20h12" />
                    </svg>
                    <div className="flex-1 border-t border-dashed border-gray-300" />
                    <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue" />
                  </div>
                  <span className="text-xs text-gray-400">{duration}</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-2xl font-bold text-gray-900">{endLabel}</span>
                  <span className="text-base font-semibold text-gray-500">{ticket.endStationForView}</span>
                </div>
              </div>
            </div>
            {/* 점선 구분 */}
            <div className="relative self-stretch">
              <div className="absolute -top-2.5 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full bg-gray-50" />
              <div className="h-full border-l border-dashed border-gray-200" />
              <div className="absolute -bottom-2.5 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full bg-gray-50" />
            </div>
            {/* 오른쪽 스텁 */}
            <div className="flex w-48 shrink-0 flex-col items-center justify-center gap-3 p-4">
              <span className="text-xs font-black tracking-tight text-gray-300">JARINARE</span>
              <button
                onClick={() => onReturnPC(groups)}
                className="rounded-lg bg-blue px-10 py-2 text-xs font-bold text-white transition-colors hover:bg-blue/90"
              >
                반환하기
              </button>
            </div>
          </div>
        ))}
      </>
    );
  }

  /* 모바일 레이아웃 — PC 카드 구조 유지, 2행으로 재배치 */
  return (
    <>
      {tickets.map(({ ticket, groups, trainTypeName, startLabel, endLabel, duration }, idx) => (
        <div key={idx} className="w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          {/* 상단: 메타 정보 */}
          <div className="flex items-center justify-between px-4 pt-3">
            <div className="flex items-center gap-1.5">
              <span className="rounded bg-lightBlue px-2 py-0.5 text-[10px] font-bold text-blue">{trainTypeName}</span>
              <span className="rounded bg-lightBlue px-2 py-0.5 text-[10px] font-bold text-blue">예약완료</span>
            </div>
            <div className="flex flex-col items-end gap-0.5 text-[10px] text-gray-400">
              <span>{ticket.startDayForView}</span>
              <span>
                {ticket.selectAdult > 0 && `어른 ${ticket.selectAdult}명`}
                {ticket.selectAdult > 0 && ticket.selectKid > 0 && ' · '}
                {ticket.selectKid > 0 && `어린이 ${ticket.selectKid}명`}
              </span>
            </div>
          </div>

          {/* 구분선 */}
          <div className="mx-4 mt-2 border-t border-dashed border-gray-200" />

          {/* 하단: 여정 + 반환 버튼 */}
          <div className="flex items-center px-4 py-3">
            {/* 여정 */}
            <div className="flex flex-1 items-center gap-2">
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-lg font-bold text-gray-900">{startLabel}</span>
                <span className="text-[10px] font-semibold text-gray-500">{ticket.startStationForView}</span>
              </div>
              <div className="flex flex-1 flex-col items-center gap-0.5">
                <div className="flex w-full items-center">
                  <div className="h-1 w-1 shrink-0 rounded-full bg-blue" />
                  <div className="flex-1 border-t border-dashed border-gray-300" />
                  <svg className="mx-1 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="3" width="16" height="14" rx="3" />
                    <path d="M4 11h16M8 3v8M16 3v8M7 17l-2 3M17 17l2 3M6 20h12" />
                  </svg>
                  <div className="flex-1 border-t border-dashed border-gray-300" />
                  <div className="h-1 w-1 shrink-0 rounded-full bg-blue" />
                </div>
                <span className="text-[9px] text-gray-400">{duration}</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-lg font-bold text-gray-900">{endLabel}</span>
                <span className="text-[10px] font-semibold text-gray-500">{ticket.endStationForView}</span>
              </div>
            </div>
            {/* 세로 구분선 */}
            <div className="mx-3 self-stretch border-l border-dashed border-gray-200" />
            {/* 반환 버튼 */}
            <button
              onClick={() => { setSeatsReturnData(groups); openModal('ReturnModal'); }}
              className="shrink-0 rounded-lg bg-blue px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-blue/90"
            >
              반환하기
            </button>
          </div>
        </div>
      ))}
      {isShow && modalType === 'ReturnModal' && <Modal />}
    </>
  );
};

export default MiniTicket;
