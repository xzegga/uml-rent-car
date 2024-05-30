
import { GarageObject } from "../models/Garaje";
import { User } from "../models/Users";
import { VehicleObject } from "../models/Vehicles";

export const localStorageKeys = [];
export const sessionStorageKeys = [];


export const initialGlobalState = {
  title: 'Lets start',
  monthSelected: new Date().getMonth(),
  yearSelected: new Date().getFullYear(),
  status: 'Activo',
  pagination: '20',
  loading: false,
  loadingMore: false,
  currentUser: {} as User,
  selectedIds: [] as string[],
  refresh: false,
  users: [] as User[],
  vehicles: [] as VehicleObject[],
  metaData: {} as any,
  garages: [] as GarageObject[],
};
