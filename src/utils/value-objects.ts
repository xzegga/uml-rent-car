export const statuses = [
    'Recibido', 'Aprovada', 'En Progreso', 
    'Completado', 'Archivado', 'En Espera', 
    'Cotizado'];

export const allStatuses = ['Activo', ...statuses];
export const monthNames = [
    { name: 'Enero', value: 0 },
    { name: 'Febrero', value: 1 },
    { name: 'Marzo', value: 2 },
    { name: 'Abril', value: 3 },
    { name: 'Mayo', value: 4 },
    { name: 'Junio', value: 5 },
    { name: 'Julio', value: 6 },
    { name: 'Agosto', value: 7 },
    { name: 'Septiembre', value: 8 },
    { name: 'Octubre', value: 9 },
    { name: 'Noviembre', value: 10 },
    { name: 'Diciembre', value: 11 }
];

export const defaultStatuses = [
    'Recibido', 'En Progreso', 'En Espera', 'Aprovada'
];
export const billingStatuses = ['En Progreso', 'Completado', 'Archivado'];