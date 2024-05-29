import {logger} from "firebase-functions/v2";
import {HttpsError} from "firebase-functions/v2/https";

/**
 * Retrieves reservation data based on specified filters and pagination options.
 *
 * @param {FirebaseFirestore.Firestore} db - The Firestore database instance.
 * @return {Promise<any>} An object containing an array of reservations data
 * and the last document for pagination.
 * @throws {HttpsError} Throws an error if there's an issue
 * retrieving reservations.
 */
export default async function getGarageData(
  db: FirebaseFirestore.Firestore
) {
  try {
    const collectionRef = db.collection("garages");
    const query = collectionRef.orderBy("created", "desc");

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
