import {DecodedIdToken, getAuth} from "firebase-admin/auth";
import {HttpsError} from "firebase-functions/v2/https";

export const ROLES = {
  Admin: "admin",
  Client: "client",
  Unauthorized: "unauthorized",
} as const;


/**
 * Validate user token sent
 *
 * @param {string} token - A vali loggue us
 * @param {CallableRequest<any>} request - The request object containing data.
 */
export default async function validateToken(token: string) {
  const auth = getAuth();
  const validToken: DecodedIdToken = await auth.verifyIdToken(token);

  if (!validToken) {
    return new HttpsError(
      "internal",
      "Error al obtener el listado de reservas"
    );
  }

  if (validToken.role !== ROLES.Admin) {
    return new HttpsError("internal", "Permisos denegados");
  }

  return validToken;
}
