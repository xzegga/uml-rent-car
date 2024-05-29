import { Timestamp } from 'firebase/firestore';

export interface Reservation {
    vehicleId: string;
    userId: string;
    startDate: Timestamp | null;
    endDate: Timestamp | null;
    mileageUsed: number;
    pickupPlace: string;
    status: string;
    deliveryTime?: Timestamp;
    created: Timestamp;
}

export interface ReservationObject {
    id: string;
    data: Reservation;
}
