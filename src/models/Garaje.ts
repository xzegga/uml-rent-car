export interface Garage {
    garageID: number; // Primary Key
    name: string;
    location: string;
    capacity: number;
    assignedVehicleID: number | null; // Foreign Key
}