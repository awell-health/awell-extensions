import { GraphQLClient } from 'graphql-request'
import { type settings } from '../../config/settings'
import z from 'zod'
const ClientSchema = z.object({
  apiUrl: z.string(),
  apiKey: z.string(),
})
export const initialiseClient = (
  s: Partial<Record<keyof typeof settings, string | undefined>>
): GraphQLClient | undefined => {
  const { apiUrl, apiKey } = ClientSchema.parse(s)
  return new GraphQLClient(apiUrl, {
    headers: {
      AuthorizationSource: 'API',
      Authorization: `Basic ${apiKey}`,
    },
  })
}
