/**
 * @role: features/hooks
 * @rule: 포인트 업데이트는 백엔드 예매 API가 내부적으로 처리 — 프론트에서 직접 호출 불필요
 */
export const useUpdatePoint = () => {
  const updatePoint = async (_point: number) => {
    // 백엔드 예매/취소 API가 포인트를 함께 처리하므로 별도 호출 불필요
  };
  return { updatePoint };
};
