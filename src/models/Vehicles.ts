export interface Vehicle {
    vehicleID: number; // Primary Key
    brand: string;
    model: string;
    year: number;
    type: string;
    plate: string;
    availability: boolean;
}