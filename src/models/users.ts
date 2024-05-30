import { User as FirebaseUser } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

export const ROLES = {
    Admin: 'admin',
    Client: 'client',
    Unauthorized: 'unauthorized'
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export type Approver = {
    uid: string;
    status: 'aprovado' | 'pendiente' | 'rechazado';
};

export type User = {
    uid: string;
    name: string;
    role: Role;
    photoUrl: string;
    email: string;
    token: string;
    dui: string;
    nit: string;
    birthday: Timestamp;
    address: string;
    approver: Approver;
    approvals: Approver[];
} & FirebaseUser;
