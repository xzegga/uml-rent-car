import {logger} from "firebase-functions/v2";
import {CallableRequest, HttpsError} from "firebase-functions/v2/https";
import getWereByDate from "../were/were-by-date";
import getWereByStatus from "../were/were-by-status";
import {Filter} from "../types/types";
import {DecodedIdToken, getAuth} from "firebase-admin/auth";
import getWereByUserId from "../were/were-by-user";

/**
 * Retrieves reservation data based on specified filters and pagination options.
 *
 * @param {FirebaseFirestore.Firestore} db - The Firestore database instance.
 * @param {CallableRequest<any>} request - The request object containing data.
 * @return {Promise<any>} An object containing an array of reservations data
 * and the last document for pagination.
 * @throws {HttpsError} Throws an error if there's an issue
 * retrieving reservations.
 */
export default async function getReservationData(
  db: FirebaseFirestore.Firestore,
  request: CallableRequest<any>
) {
  const {
    status,
    monthSelected,
    yearSelected,
    pagination,
    lastDoc,
    newQuery,
    token,
    userId,
  } = request.data as any;

  const auth = getAuth();
  const validToken: DecodedIdToken = await auth.verifyIdToken(token);

  if (!validToken) {
    return new HttpsError("internal", "Error al obtener la lista de reservas");
  }

  if (validToken.role === "unauthorized") {
    return new HttpsError("internal", "Permiso denegado");
  }

  const whereClause: Filter[] = [];

  if (userId) await getWereByUserId(userId, whereClause);

  await getWereByStatus(status, whereClause);
  await getWereByDate(monthSelected, yearSelected, whereClause);

  try {
    const collectionRef = db.collection("reservations");
    let query = collectionRef.orderBy("created", "desc");

    // Apply where clauses if any
    if (whereClause.length > 0) {
      whereClause.forEach((clause) => {
        query = query.where(clause.field, clause.operator, clause.value);
      });
    }

    const snapshot = await query.count().get();

    if (snapshot.data().count === 0) return [];

    const count = snapshot.data().count;
    const paging = pagination !== "All" ?
      parseInt(pagination) : snapshot.data().count;

    if (lastDoc && !newQuery) {
      const lastSnapShot = await collectionRef.doc(lastDoc).get();
      query = query.startAfter(lastSnapShot);
    }

    query = query.limit(paging);

    const querySnapshot = await query.get();

    if (querySnapshot.empty) {
      return {reservations: [], lastDoc: null, count: 0};
    }

    const nextLastDoc =
      querySnapshot.docs[querySnapshot.docs.length - 1].id;

    const reservationsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      data: doc.data(),
    }));

    return {reservations: reservationsData, lastDoc: nextLastDoc, count};
  } catch (error) {
    logger.error(
      "Error al tratar de establecer los filtros seleccionados",
      error
    );
    throw new HttpsError("internal", "Error al obtener las reservas", error);
  }
}
