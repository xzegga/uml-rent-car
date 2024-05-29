import { doc, collection, getDoc, Timestamp, addDoc, writeBatch, getDocs } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../utils/init-firebase';
import { Vehicle, VehicleObject } from '../models/Vehicles';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Doc } from '../models/Document';
import { saveDocuments } from './Documents';

export const getAllVehicles = async (params: any): Promise<VehicleObject[]> => {
    const functions = getFunctions();
    const getAllVehicles = httpsCallable(functions, 'getVehicles');
    const vehicles: any = await getAllVehicles(params);

    return vehicles.data.items.map((vehicle: any) => ({
        id: vehicle.id,
        data: vehicle.data
    }));
};

export const getVehicleById = async (id: string) => {
    const docRef = doc(collection(db, 'vehicles'), id);
    const docSnap = await getDoc(docRef);
    return {
        id: docSnap.id,
        data: docSnap.data() as Vehicle
    };
};

export const saveVehicle = async (vehicle: Vehicle, files: Doc[]) => {
    try {
        const vehicleDoc = collection(db, 'vehicles');
        const created = vehicle.created ? vehicle.created : Timestamp.now();

        const vehicleRef = await addDoc(vehicleDoc, {
            ...vehicle,
            created,
        });

        saveDocuments(files, vehicleRef);
    } catch (error) {
        console.log(error);
    }
};

export const deleteVehicle = async (id: string) => {
    if (!id) return;

    const projectRef = doc(collection(db, 'vehicles'), id);
    const queryDocs = collection(projectRef, 'documents');

    const batch = writeBatch(db);
    const documentToDelete: string[] = [];

    const docSnap = await getDocs(queryDocs);
    for (const docRec of docSnap.docs) {
        documentToDelete.push(docRec.data().path);

        const targetDocs = collection(docRec.ref, 'documents');
        const docs = await getDocs(targetDocs);

        docs.docs.forEach(async (docTRec) => {
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
};



export const updateAvailability = async (ids: string[], available: boolean) => {
    // Initialize a Firestore write batch
    const batch = writeBatch(db);

    // Reference to the project collection
    const vehicleRef = collection(db, 'vehicles');

    // Loop through each project ID and update its state field
    ids.forEach((id) => {
        const vehicleDocRef = doc(vehicleRef, id);
        batch.update(vehicleDocRef, { available });
    });

    try {
        await batch.commit();
        return { type: 'success', message: 'Batch update successful' };
    } catch (error) {
        return { type: 'error', message: 'Error updating projects' };
    }
};
