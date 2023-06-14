import { GraphQLClient } from 'graphql-request'
import { isNil } from 'lodash'
import { getHealthieErrorFromResponse, HealthieError } from './errors'
import { type settings } from './settings'

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
      responseMiddleware: (response) => {
        if (response instanceof HealthieError) {
          return
        }

        const errors = getHealthieErrorFromResponse(response)
        if (!isNil(errors) && errors.length > 0) {
          throw new HealthieError(errors)
        }
      },
    })
  }
  return undefined
}
