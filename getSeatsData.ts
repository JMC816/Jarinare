import { SeatType } from './src/entities/Seat/types/seatType';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from './src/shared/firebase/firebase';

const getSeats = async (): Promise<SeatType[]> => {
  const trainNos = ['1', '2', '3', '4'];
  let allSeats: SeatType[] = [];

  const trainCol = await getDocs(collection(db, 'train'));

  for (const trainDoc of trainCol.docs) {
    for (const trainNoId of trainNos) {
      const seatsQuery = query(
        collection(db, 'train', trainDoc.id, 'no', trainNoId, 'seats'),
        orderBy('createAt'),
      );

      const existSeats = await getDocs(seatsQuery);

      const seats = existSeats.docs.map((doc) => {
        const data = doc.data();
        return {
          ...(data as SeatType),
          accessToken: data.kakoTokens,
        } as SeatType;
      });

      allSeats = [...allSeats, ...seats];
    }
  }

  return allSeats;
};

export default getSeats;
