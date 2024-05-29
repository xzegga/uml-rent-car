import { User } from "../context/AuthContext";
import { GarageObject } from "../models/Garaje";
import { ROLES } from "../models/Users";
import { VehicleObject } from "../models/Vehicles";

export const localStorageKeys = [];
export const sessionStorageKeys = [];

type Role = typeof ROLES[keyof typeof ROLES];

export type LoggedUser = {
  uid: string,
  role: Role,
  department: string,
  name: string,
  photoUrl: string,
  email: string,
  token: string,
} & User;

export const initialGlobalState = {
  title: 'Lets start',
  monthSelected: new Date().getMonth(),
  yearSelected: new Date().getFullYear(),
  status: 'Activo',
  pagination: '20',
  loading: false,
  loadingMore: false,
  currentUser: {} as LoggedUser,
  selectedIds: [] as string[],
  refresh: false,
  users: [] as User[],
  vehicles: [] as VehicleObject[],
  metaData: {} as any,
  garages: [] as GarageObject[],
};
