import DocuSignSdk from 'docusign-esign'

/**
 * Creates a DocuSign `ApiClient` and authorizes with JWT
 */
export const createClient = async ({
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
  client.setBasePath(baseUrl)

  const authResult = await client.requestJWTUserToken(
    integrationKey,
    userId,
    ['signature'],
    Buffer.from(rsaKey, 'base64'),
    6000
  )
  client.addDefaultHeader(
    'Authorization',
    `Bearer ${(authResult?.body?.accessToken as string) ?? ''}`
  )

  return client
}
