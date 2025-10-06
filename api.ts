import { kakaoMessage } from './src/features/Notification/hooks/kakaoMessage';
import getSeats from './getSeatsData';

export default async function sendKakaoMessages() {
  const seatsAllInfo = await getSeats();
  if (!seatsAllInfo) return;

  const now = new Date();

  for (const ticket of seatsAllInfo) {
    const startTime = new Date(ticket.startTime);
    const diffMinutes = (startTime.getTime() - now.getTime()) / (1000 * 60);

    if (Math.round(diffMinutes) === 5) {
      if (ticket.accessToken) {
        try {
          await kakaoMessage(ticket.accessToken);
          console.log(`카카오 메시지 전송 성공: ${ticket.userId}`);
        } catch (err) {
          console.error(`카카오 메시지 전송 실패: ${ticket.userId}`, err);
        }
      } else {
        console.warn(`토큰이 없어 메시지를 전송할 수 없음: ${ticket.userId}`);
      }
    }
  }
}
