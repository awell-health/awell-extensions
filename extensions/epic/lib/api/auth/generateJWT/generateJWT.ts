import { randomUUID } from 'crypto'
import jwt from 'jsonwebtoken'

/**
 * Generates a JWT for Epic's FHIR integration.
 * @param clientId - The client ID for the app.
 * @param tokenEndpoint - The FHIR authorization server's token endpoint URL.
 * @param privateKey - The private key to sign the JWT.
 * @returns The signed JWT.
 */
export const generateJWT = (
  clientId: string,
  tokenEndpoint: string,
  privateKey: string,
): string => {
  const nowInSeconds = Math.floor(Date.now() / 1000)
  const jwtHeader = {
    alg: 'RS384',
    typ: 'JWT',
  }

  const jwtPayload = {
    iss: clientId,
    sub: clientId,
    aud: tokenEndpoint,
    jti: randomUUID(),
    exp: nowInSeconds + 300, // 5 minutes in the future
    nbf: nowInSeconds,
    iat: nowInSeconds,
  }

  const token = jwt.sign(jwtPayload, privateKey, {
    algorithm: 'RS384',
    header: jwtHeader,
  })

  return token
}
