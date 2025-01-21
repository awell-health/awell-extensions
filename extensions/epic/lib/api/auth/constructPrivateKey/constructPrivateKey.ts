/**
 * Transforms a single-line private key with explicit \n into a properly formatted private key.
 * @param inputKey - The single-line private key string.
 * @returns The correctly formatted private key string.
 */
export const constructPrivateKey = (privateKey: string): string => {
  // Replace explicit \n with actual newlines
  const formattedKey = privateKey.replace(/\\n/g, '\n')

  return formattedKey
}
