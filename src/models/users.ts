export const ROLES = {
    Admin: 'admin',
    Client: 'client',
    Unauthorized: 'unauthorized'
} as const;

export interface User {
    userID: number; // Primary Key
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    userType: string;
    approvingClientID: number | null; // Foreign Key
}
