import { Timestamp } from "firebase/firestore";

export interface Vehicle {
    vehicleId?: string; 
    brand: string;
    model: string;
    year: number;
    type: string;
    plate: string;
    milleage: number;
    available: boolean;
    created: Timestamp;
    documents?: Document[];
}

export interface VehicleObject {
    id: string;
    data: Vehicle;
}
