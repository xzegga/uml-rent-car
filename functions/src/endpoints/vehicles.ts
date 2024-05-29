import {logger} from "firebase-functions/v2";
import {CallableRequest, HttpsError} from "firebase-functions/v2/https";
import {Filter} from "../types/types";

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
export default async function getVehicleData(
  db: FirebaseFirestore.Firestore,
  request: CallableRequest<any>
) {
  const {type} = request.data as any;

  try {
    const collectionRef = db.collection("vehicles");
    let query = collectionRef.orderBy("created", "desc");

    const whereClause: Filter[] = [];

    if (type) {
      whereClause.push({
        field: "type",
        operator: "==",
        value: type,
      });
    }

    // Apply where clauses if any
    if (whereClause.length > 0) {
      whereClause.forEach((clause) => {
        query = query.where(clause.field, clause.operator, clause.value);
      });
    }

    const snapshot = await query.count().get();
    const count = snapshot.data().count;

    if (snapshot.data().count === 0) return [];

    const querySnapshot = await query.get();

    if (querySnapshot.empty) {
      return {items: [], count: 0};
    }

    const items = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      data: doc.data(),
    }));

    return {items, count};
  } catch (error) {
    logger.error(
      "Error al tratar de establecer los filtros seleccionados",
      error
    );
    throw new HttpsError(
      "internal",
      "Error al obtener las reservas",
      error
    );
  }
}
