import { Timestamp } from "firebase/firestore";

export interface Garage {
    garageId?: number; // Primary Key
    name: string;
    location: string;
    capacity: number;
    vehicleId: string; // Foreign Key
    created: Timestamp
}

export interface GarageObject {
    id: string;
    data: Garage;
}