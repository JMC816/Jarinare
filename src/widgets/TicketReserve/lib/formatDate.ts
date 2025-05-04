export const formatDate = (date: Date) => {
  const week = ['일', '월', '화', '수', '목', '금', '토'];
  const month = date.getMonth();
  const day = date.getDate();
  const dayOfWeek = week[date.getDay()];
  const dateStr = `${month}월 ${day}일 (${dayOfWeek})`;
  return dateStr;
};
