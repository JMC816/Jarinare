export const formatDateForView = (date: Date) => {
  const week = ['일', '월', '화', '수', '목', '금', '토'];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = week[date.getDay()];
  return `${month}월 ${day}일 (${dayOfWeek})`;
};

export const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}${month}${day}`;
};

export const formatTimeView = (time: string) => {
  const hour = time.substring(8, 10);
  const min = time.substring(10, 12);
  return `${hour}` + ':' + `${min}`;
};

export const formatTime = () => {
  const date = formatTodayDate();
  const hour = date.toString().substring(8, 10);
  const min = date.toString().substring(10, 12);
  return `${hour}${min}`;
};

export const formatAM_PM = (time: string) => {
  const am_pm = time.substring(8, 10);
  return Number(am_pm);
};

export const formatTodayDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);
  return Number(year + month + day + hours + minutes + seconds);
};

export const isToday = () => {
  const day = new Date();
  const today = formatDate(day);
  return today;
};

export const formatStartDate = (startDay: string) => {
  const year = Number(startDay.slice(0, 4));
  const month = Number(startDay.slice(4, 6)) - 1;
  const days = Number(startDay.slice(6, 8));
  return new Date(year, month, days);
};

export const formatStartTime = (startTime: string) => {
  const year = Number(startTime.slice(0, 4));
  const month = Number(startTime.slice(4, 6)) - 1;
  const days = Number(startTime.slice(6, 8));
  const hours = Number(startTime.slice(8, 10));
  const minutes = Number(startTime.slice(10, 12));
  return new Date(year, month, days, hours, minutes);
};
