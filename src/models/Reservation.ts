import { Timestamp } from 'firebase/firestore';

export interface Reservation {
    reservationId: number;
    vehicleID: number;
    clientID: number;
    startDate: Timestamp;
    endDate: Timestamp;
    mileageUsed: number;
    deliveryTime: Timestamp;
    status: string;
    created: Timestamp;
    tenant: string;
}

export interface ReservationObject {
    id: string;
    data: Reservation;
}
