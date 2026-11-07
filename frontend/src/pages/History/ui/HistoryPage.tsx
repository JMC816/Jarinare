/**
 * @role: pages — 결제/포인트 내역 페이지
 * @rule: 레이아웃·조합만 담당, 비즈니스 로직 포함 금지
 */
import { useNavigate } from 'react-router-dom';
import backward from '@/assets/icons/backward.png';
import { useHistoryFilter } from '../hooks/useHistoryFilter';
import type { PeriodMode, TypeMode, SortMode } from '../hooks/useHistoryFilter';

type SegItem = { value: string; label: string };

const SegmentGroup = ({ items, value, onChange }: { items: SegItem[]; value: string; onChange: (v: string) => void }) => (
  <div className="flex items-center gap-1 rounded-sm bg-gray-100 p-1">
    {items.map(item => (
      <button
        key={item.value}
        onClick={() => onChange(item.value)}
        className={`flex-1 rounded-sm py-2 text-sm font-bold transition-colors ${value === item.value ? 'bg-blue text-white' : 'text-gray-400'}`}
      >
        {item.label}
      </button>
    ))}
  </div>
);

const HistoryPage = () => {
  const navigate = useNavigate();
  const {
    tab, switchTab,
    year, month, goPrev, goNext,
    filterOpen, setFilterOpen, openFilter,
    draftPeriod, setDraftPeriod,
    draftType, setDraftType,
    draftSort, setDraftSort,
    customStart, setCustomStart,
    customEnd, setCustomEnd,
    appliedPeriod, appliedSort,
    isCurrentMonth, isFiltered,
    groupedOrders, groupedPoints,
    periodLabel, typeLabel,
    handleApply,
  } = useHistoryFilter();

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50 lg:hidden">
      {/* 헤더 */}
      <div className="flex w-full items-center bg-white/80 px-[28px] pb-[4px] pt-[20px] backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img onClick={() => navigate(-1)} src={backward} className="h-[20px] w-[12px] cursor-pointer" />
          <span className="text-lg font-bold">결제/포인트 내역</span>
        </div>
      </div>
      <div className="h-2 w-full border-b border-gray-200/50 bg-white/80" />

      {/* 탭 */}
      <div className="mt-4 flex border-b border-gray-100 px-[28px]">
        <button onClick={() => switchTab('payment')} className={`mr-5 pb-2.5 text-base font-bold transition-colors ${tab === 'payment' ? 'border-b-2 border-blue text-blue' : 'text-gray-300'}`}>결제 내역</button>
        <button onClick={() => switchTab('point')} className={`pb-2.5 text-base font-bold transition-colors ${tab === 'point' ? 'border-b-2 border-blue text-blue' : 'text-gray-300'}`}>포인트 내역</button>
      </div>

      <div className="flex flex-col px-[28px] pt-4">
        {/* 월 네비게이션 */}
        <div className="flex w-full items-center justify-between">
          {appliedPeriod === 'all' ? (
            <>
              <button onClick={goPrev} className="flex h-8 w-8 items-center justify-center rounded-full active:bg-gray-100">
                <svg width="7" height="12" viewBox="0 0 8 14" fill="none"><path d="M7 1L1 7L7 13" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <span className="text-base font-bold text-gray-800">{year}.{String(month).padStart(2, '0')}</span>
              <button onClick={goNext} disabled={isCurrentMonth} className={`flex h-8 w-8 items-center justify-center rounded-full active:bg-gray-100 ${isCurrentMonth ? 'opacity-30' : ''}`}>
                <svg width="7" height="12" viewBox="0 0 8 14" fill="none"><path d="M1 1L7 7L1 13" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </>
          ) : (
            <span className="text-base font-bold text-gray-800">{periodLabel} 조회 결과</span>
          )}
        </div>

        {/* 내역 목록 */}
        <div className="mt-3 flex flex-col pb-32">
          {tab === 'payment' && (
            groupedOrders.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-xl bg-white text-base text-gray-300 shadow-sm">해당 기간에 결제 내역이 없습니다</div>
            ) : groupedOrders.map(({ date, label, items }) => (
              <div key={date} className="mb-4">
                <span className="mb-2 block text-sm font-bold text-gray-400">{label}</span>
                <div className="flex flex-col gap-2">
                  {items.map((order, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl bg-white px-5 py-4 shadow-sm">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base font-bold text-gray-800">{order.startStationForView} → {order.endStationForView}</span>
                          {order.isReturn && <span className="rounded bg-red/10 px-1.5 py-0.5 text-xs font-bold text-red">반환</span>}
                        </div>
                        <span className="text-sm text-gray-400">{order.trainType}</span>
                      </div>
                      <span className={`text-base font-semibold ${order.isReturn ? 'text-red' : 'text-blue'}`}>
                        {order.isReturn ? '-' : ''}{Number(order.finalPrice).toLocaleString('ko-KR')}원
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          {tab === 'point' && (
            groupedPoints.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-xl bg-white text-base text-gray-300 shadow-sm">해당 기간에 포인트 내역이 없습니다</div>
            ) : groupedPoints.map(({ date, label, items }) => (
              <div key={date} className="mb-4">
                <span className="mb-2 block text-sm font-bold text-gray-400">{label}</span>
                <div className="flex flex-col gap-2">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl bg-white px-5 py-4 shadow-sm">
                      <span className="text-base font-bold text-gray-800">{item.accruedPoint > 0 ? '포인트 적립' : '포인트 사용'}</span>
                      <span className={`text-base font-semibold ${item.accruedPoint > 0 ? 'text-blue' : 'text-red'}`}>
                        {item.accruedPoint > 0 ? '+' : ''}{Number(item.accruedPoint).toLocaleString('ko-KR')}P
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 플로팅 필터 버튼 */}
      <button
        onClick={openFilter}
        className="fixed bottom-[88px] left-1/2 z-40 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-blue px-5 py-3 text-sm font-bold text-white shadow-lg active:brightness-95"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="21" y1="4" x2="14" y2="4" /><line x1="10" y1="4" x2="3" y2="4" />
          <line x1="21" y1="12" x2="12" y2="12" /><line x1="8" y1="12" x2="3" y2="12" />
          <line x1="21" y1="20" x2="16" y2="20" /><line x1="12" y1="20" x2="3" y2="20" />
          <line x1="14" y1="2" x2="14" y2="6" /><line x1="8" y1="10" x2="8" y2="14" /><line x1="16" y1="18" x2="16" y2="22" />
        </svg>
        {isFiltered ? `${periodLabel} · ${typeLabel} · ${appliedSort === 'newest' ? '최신순' : '과거순'}` : '필터'}
      </button>

      {/* 필터 모달 */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-end bg-black/40" onClick={() => setFilterOpen(false)}>
          <div className="mb-4 w-[343px] animate-slide-up rounded-3xl bg-white px-6 pb-8 pt-5" onClick={e => e.stopPropagation()}>
            <div className="mb-5 flex justify-center">
              <div className="h-1 w-10 rounded-full bg-gray-300" />
            </div>

            {/* 조회 기간 */}
            <p className="mb-3 text-base font-bold text-gray-800">조회 기간</p>
            <SegmentGroup
              items={[{ value: 'all', label: '전체' }, { value: '1month', label: '1개월' }, { value: '3month', label: '3개월' }, { value: 'custom', label: '직접설정' }]}
              value={draftPeriod}
              onChange={v => setDraftPeriod(v as PeriodMode)}
            />
            {draftPeriod === 'custom' && (
              <div className="mt-2 flex items-center gap-2">
                <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-blue" />
                <span className="text-xs text-gray-400">~</span>
                <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-blue" />
              </div>
            )}

            {/* 거래 유형 */}
            <p className="mb-3 mt-5 text-base font-bold text-gray-800">거래 유형</p>
            {tab === 'payment' ? (
              <SegmentGroup
                items={[{ value: 'all', label: '전체' }, { value: 'purchase', label: '구매' }, { value: 'return', label: '반환' }]}
                value={draftType}
                onChange={v => setDraftType(v as TypeMode)}
              />
            ) : (
              <SegmentGroup
                items={[{ value: 'all', label: '전체' }, { value: 'earn', label: '적립' }, { value: 'spend', label: '사용' }]}
                value={draftType}
                onChange={v => setDraftType(v as TypeMode)}
              />
            )}

            {/* 정렬 */}
            <p className="mb-3 mt-5 text-base font-bold text-gray-800">거래 내역 정렬</p>
            <SegmentGroup
              items={[{ value: 'newest', label: '최신순' }, { value: 'oldest', label: '과거순' }]}
              value={draftSort}
              onChange={v => setDraftSort(v as SortMode)}
            />

            <button onClick={handleApply} className="mt-6 w-full rounded-2xl bg-blue py-3.5 text-base font-bold text-white active:brightness-95">
              조회
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
