import { addDoc, collection, doc, getDoc, getDocs, query, Timestamp, where, writeBatch } from 'firebase/firestore';
import { twoDigitDate } from '../utils/helpers';
import { db } from '../utils/init-firebase';
import { Reservation } from '../models/Reservation';

export const getReservationById = async (projectId: string) => {
    const docRef = doc(collection(db, 'reservations'), projectId);
    const docSnap = await getDoc(docRef);
    return {
        id: docSnap.id,
        data: docSnap.data() as Reservation
    };
};

export const saveReservation = async (reservation: Reservation) => {
    try {
        const reservationDoc = collection(db, 'reservations');
        const created = reservation.created ? reservation.created : Timestamp.now();

        await addDoc(reservationDoc, {
            ...reservation,
            created,
        });
        
    } catch (error) {
        console.log(error);
    }
};

export const getCorrelativeID = async (code: string, reservation?: Reservation) => {
    const created: Timestamp | undefined = reservation?.created;
    const createdDate = created?.toDate() || new Date();
    const today = Timestamp.fromDate(new Date(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate()));
    const q = query(collection(db, 'projects'), where('created', '>=', today));

    const querySnapshot = await getDocs(q);

    // Build project id base on current date and correlative
    const date = created?.toDate() || new Date();
    const month = twoDigitDate(date.getMonth() + 1);
    const day = twoDigitDate(date.getDate());
    const year = date.getFullYear().toString().slice(-2);

    const count = querySnapshot.docs.length;
    // Get alphabete letter by index

    const letter = count > 0 ? `-${String.fromCharCode(65 + count)}` : '';
    const reservationId = `${code}-${month}${day}${year}${letter}`;
    return reservationId;
};

export const getCounter = async (key: string) => {
    const q = doc(collection(db, 'counters'), key);
    const docSnap = (await getDoc(q)).data();
    // Get async data from docSnap
    return docSnap;
};

export const deleteReservation = async (id: string) => {
    if (!id) return;

    const projectRef = doc(collection(db, 'reservations'), id);
    const batch = writeBatch(db);

    batch.delete(projectRef);
    await batch.commit();

};

export const updateStatus = async (ids: string[], status: string) => {
    // Initialize a Firestore write batch
    const batch = writeBatch(db);

    // Reference to the project collection
    const projectsRef = collection(db, 'reservations');

    // Loop through each project ID and update its state field
    ids.forEach((id) => {
        const projectDocRef = doc(projectsRef, id);
        batch.update(projectDocRef, { status });
    });

    try {
        await batch.commit();
        return { type: 'success', message: 'Batch update successful' };
    } catch (error) {
        return { type: 'error', message: 'Error updating projects' };
    }
};
