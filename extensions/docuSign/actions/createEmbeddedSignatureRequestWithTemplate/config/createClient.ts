import DocuSignSdk from 'docusign-esign'

/**
 * Validates and decodes the RSA private key from either raw PEM or base64-encoded PEM format
 */
const decodeRsaPrivateKey = (rsaKey: string): Buffer => {
  if (rsaKey.includes('BEGIN') && rsaKey.includes('PRIVATE KEY')) {
    return Buffer.from(rsaKey, 'utf8')
  }

  let decodedKey: string
  try {
    decodedKey = Buffer.from(rsaKey.trim(), 'base64').toString('utf8')
  } catch (error) {
    throw new Error(
      'Invalid RSA private key format. The key must be either a valid PEM format (with BEGIN/END headers) or a base64-encoded PEM. Please ensure you have base64-encoded the entire PEM file including the -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY----- lines.'
    )
  }

  if (!decodedKey.includes('BEGIN') || !decodedKey.includes('PRIVATE KEY')) {
    throw new Error(
      'Invalid RSA private key format. After base64 decoding, the key does not contain valid PEM headers. Please base64-encode the entire PEM file including the -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY----- lines and all newlines.'
    )
  }

  return Buffer.from(decodedKey, 'utf8')
}

/**
 * Creates a DocuSign `ApiClient` and authorizes with JWT
 */
export const createApiClient = async ({
  integrationKey,
  userId,
  rsaKey,
  baseUrl,
}: {
  integrationKey: string
  userId: string
  rsaKey: string
  baseUrl: string
}): Promise<DocuSignSdk.ApiClient> => {
  const client = new DocuSignSdk.ApiClient()
  client.setBasePath(`${baseUrl}/restapi`)

  const privateKeyBuffer = decodeRsaPrivateKey(rsaKey)

  const authResult = await client.requestJWTUserToken(
    integrationKey,
    userId,
    ['signature'],
    privateKeyBuffer,
    6000
  )
  client.addDefaultHeader(
    'Authorization',
    `Bearer ${(authResult?.body?.access_token as string) ?? ''}`
  )

  return client
}
