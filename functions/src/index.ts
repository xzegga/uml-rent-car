import {initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import {getFirestore} from "firebase-admin/firestore";
import {onCall} from "firebase-functions/v2/https";

import getReservationData from "./endpoints/reservations";
import setRoles from "./endpoints/roles";
import {removeUserData, saveUserData} from "./endpoints/users";
import getVehicleData from "./endpoints/vehicles";
import getGarageData from "./endpoints/garages";

initializeApp();
const db = getFirestore();

export const assignUserClaims = onCall(async (request) => {
  await setRoles(request);
});

export const getReservations = onCall(async (request) => {
  const revData = await getReservationData(db, request);
  return revData;
});

export const getVehicles = onCall(async (request) => {
  const vehicleData = await getVehicleData(db, request);
  return vehicleData;
});

export const getGarages = onCall(async () => {
  const vehicleData = await getGarageData(db);
  return vehicleData;
});

export const saveUser = onCall(async (request) => {
  const user = await saveUserData(db, request);
  return user;
});

export const removeUser = onCall(async (request) => {
  const user = await removeUserData(db, request);
  return user;
});

export const verifyToken = onCall(async (request) => {
  const {token} = request.data;
  try {
    await getAuth().verifyIdToken(token, true);
    return {valid: true};
  } catch {
    return {valid: false};
  }
});
