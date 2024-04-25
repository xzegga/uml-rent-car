// Reservation table interface
export interface Reservation {
    reservationID: number; // Primary Key
    vehicleID: number; // Foreign Key
    clientID: number; // Foreign Key
    startDate: Date;
    endDate: Date;
    mileageUsed: number;
    deliveryTime: Date;
    status: string;
}