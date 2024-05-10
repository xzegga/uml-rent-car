import { addDoc, collection, doc, getDoc, getDocs, query, setDoc, Timestamp, where, writeBatch } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { Project } from '../models/project';
import { twoDigitDate } from '../utils/helpers';
import { db, storage } from '../utils/init-firebase';
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
            status: reservation.status,
            tenant: reservation.tenant,
            vehicleID: reservation.vehicleID,
            clientID: reservation.clientID,
            created,
            mileageUsed: 56525,
        });
    } catch (error) {
        console.log(error);
    }
};

export const getCorrelativeID = async (code: string, reservation?: Project) => {
    const created: Timestamp | undefined = reservation?.created;
    const createdDate = created?.toDate() || new Date();
    const today = Timestamp.fromDate(new Date(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate()));
    const q = query(collection(db, 'projects'), where('created', '>=', today), where('tenant', '==', reservation?.tenant), where('department', '==', reservation?.department));

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
    const queryDocs = collection(projectRef, 'documents');

    const batch = writeBatch(db);
    const documentToDelete: string[] = [];

    const docSnap = await getDocs(queryDocs);
    for (const docRec of docSnap.docs) {
        documentToDelete.push(docRec.data().path);

        const targetDocs = collection(docRec.ref, 'documents');
        const docs = await getDocs(targetDocs);

        docs.docs.forEach(async (docTRec) => {
            console.log(docTRec.id);
            documentToDelete.push(docTRec.data().path);
            batch.delete(docTRec.ref);
        });

        batch.delete(docRec.ref);
    }

    for (const document of documentToDelete) {
        const itemRef = ref(storage, document);
        await deleteObject(itemRef);
    }

    batch.delete(projectRef);
    await batch.commit();

    const counterProj = doc(db, 'counters', 'projects');
    const counter = await getCounter('projects');
    await setDoc(counterProj, { value: counter?.value - 1 });
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
        // Commit the batch operation
        await batch.commit();
        return {type: 'success', message: 'Batch update successful'};
    } catch (error) {
        return {type: 'error', message: 'Error updating projects'};
    }
};
