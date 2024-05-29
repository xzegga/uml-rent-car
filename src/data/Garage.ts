import { doc, collection, getDoc, Timestamp, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../utils/init-firebase';
import { VehicleObject } from '../models/Vehicles';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Garage } from '../models/Garaje';

export const getAllGarages = async (params: any): Promise<VehicleObject[]> => {
    const functions = getFunctions();
    const getAllGaragesFn = httpsCallable(functions, 'getGarages');
    const garages: any = await getAllGaragesFn(params);

    return garages.data.items.map((garage: any) => ({
        id: garage.id,
        data: garage.data
    }));
};

export const getGarageById = async (id: string) => {
    const docRef = doc(collection(db, 'garages'), id);
    const docSnap = await getDoc(docRef);
    return {
        id: docSnap.id,
        data: docSnap.data() as Garage
    };
};

export const saveGarage = async (garage: Garage) => {
    try {
        const garageDoc = collection(db, 'garages');
        const created = garage.created ? garage.created : Timestamp.now();

        await addDoc(garageDoc, {
            ...garage,
            created,
        });

    } catch (error) {
        console.log(error);
    }
};

export const deleteGarage = async (id: string) => {
    if (!id) return;

    const projectRef = doc(collection(db, 'garages'), id);
    await deleteDoc(projectRef);

};
