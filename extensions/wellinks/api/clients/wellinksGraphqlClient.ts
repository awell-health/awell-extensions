import { GraphQLClient } from 'graphql-request'
import { type settings } from '../../config/settings'

export const initialiseClient = (
  s: Record<keyof typeof settings, string | undefined>
): GraphQLClient | undefined => {
  const { apiUrl, apiKey } = s
  if (apiUrl !== undefined && apiKey !== undefined) {
    return new GraphQLClient(apiUrl, {
      headers: {
        AuthorizationSource: 'API',
        Authorization: `Basic ${apiKey}`,
      },
    })
  }
  return undefined
}
