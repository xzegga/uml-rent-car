import {logger} from "firebase-functions/v2";
import {CallableRequest, HttpsError} from "firebase-functions/v2/https";
import {DecodedIdToken, getAuth} from "firebase-admin/auth";

/**
 * Retrieves project data based on specified filters and pagination options.
 *
 * @param {CallableRequest<any>} request - The request object containing data.
 * @return {Promise<any>} An object containing an array of projects data
 * and the last document for pagination.
 * @throws {HttpsError} Throws an error if there's an issue retrieving projects.
 */
export default async function setRoles(request: CallableRequest<any>) {
  const {email, customClaims, token} = request.data;

  if (!email || !customClaims || !token) {
    return new HttpsError("invalid-argument", "Faltan campos requeridos");
  }

  const auth = getAuth();
  const validToken: DecodedIdToken = await auth.verifyIdToken(token);

  if (!validToken || validToken.role !== "admin") {
    return new HttpsError("internal", "Permiso denegado");
  }

  try {
    const user = await auth.getUserByEmail(email);
    await getAuth().setCustomUserClaims(user.uid, {
      ...user.customClaims,
      ...customClaims,
    });

    return {message: "Roles asignados correctamente"};
  } catch (error: any) {
    logger.error(
      `Error al asignar el rol al usuario con el email ${email}:`,
      error
    );
    return new HttpsError(
      "internal", `Error al asignar el rol: (${error.message})`
    );
  }
}
