import { GraphQLClient } from 'graphql-request'
import { type PatchedRequestInit } from 'graphql-request/dist/types'
import { isNil } from 'lodash'
import { getHealthieErrorFromResponse, HealthieError } from './errors'
import { type settings } from '../../../settings'

export const responseMiddleware: Required<PatchedRequestInit>['responseMiddleware'] =
  (response) => {
    if (response instanceof HealthieError) {
      return
    }

    const errors = getHealthieErrorFromResponse(response)
    if (!isNil(errors) && errors.length > 0) {
      throw new HealthieError(errors)
    }
  }

/**
 * @deprecated DO NOT USE
 * DO NOT USE
 */
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
      responseMiddleware,
    })
  }
  return undefined
}
