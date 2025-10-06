import { SeatType } from './src/entities/Seat/types/seatType';
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

const getSeats = async (): Promise<SeatType[]> => {
  const trainNos = ['1', '2', '3', '4'];
  let allSeats: SeatType[] = [];

  const trainCol = await db.collection('train').get();

  for (const trainDoc of trainCol.docs) {
    for (const trainNoId of trainNos) {
      const seatsSnap = await db
        .collection('train')
        .doc(trainDoc.id)
        .collection('no')
        .doc(trainNoId)
        .collection('seats')
        .orderBy('createAt')
        .get();

      const seats = seatsSnap.docs.map((doc) => {
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
