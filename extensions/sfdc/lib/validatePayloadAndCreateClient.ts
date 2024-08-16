import {
  type OAuthGrantClientCredentialsRequest,
  type OAuthGrantPasswordRequest,
  validate,
} from '@awell-health/extensions-core'
import { isEmpty } from 'lodash'
import z from 'zod'
import { SalesforceRestAPIClient } from '../api/client'
import {
  DEFAULT_API_VERSION,
  getApiUrl,
  getAuthUrl,
  type GrantType,
} from '../api/constants'
import { SettingsValidationSchema } from '../settings'

type ValidateAndCreateClient = <T extends z.ZodTypeAny>(args: {
  fieldsSchema: T
  payload: unknown
}) => Promise<{
  salesforceClient: SalesforceRestAPIClient
  fields: z.infer<(typeof args)['fieldsSchema']>
  settings: z.infer<typeof SettingsValidationSchema>
  pathwayId: string
  activityId: string
}>

export const validatePayloadAndCreateClient: ValidateAndCreateClient = async ({
  fieldsSchema,
  payload,
}) => {
  const {
    settings: {
      salesforceSubdomain,
      clientId,
      clientSecret,
      username,
      password,
      apiVersion,
    },
    pathway: { id: pathwayId },
    activity: { id: activityId },
    fields,
    settings,
  } = validate({
    schema: z.object({
      fields: fieldsSchema,
      settings: SettingsValidationSchema,
      pathway: z.object({ id: z.string() }),
      activity: z.object({ id: z.string() }),
    }),
    payload,
  })

  const getGrantType = (): GrantType => {
    if (isEmpty(username) || isEmpty(password)) return 'client_credentials'

    return 'password'
  }

  const grantType = getGrantType()

  const getRequestConfig = ():
    | Omit<OAuthGrantClientCredentialsRequest, 'grant_type'>
    | Omit<OAuthGrantPasswordRequest, 'grant_type'> => {
    if (grantType === 'client_credentials')
      return {
        client_id: clientId,
        client_secret: clientSecret,
      } satisfies Omit<OAuthGrantClientCredentialsRequest, 'grant_type'>

    if (!isEmpty(username) && !isEmpty(password)) {
      return {
        client_id: clientId,
        client_secret: clientSecret,
        username: username as string,
        password: password as string,
      } satisfies Omit<OAuthGrantPasswordRequest, 'grant_type'>
    }

    throw new Error('Should not happen')
  }

  const salesforceClient = new SalesforceRestAPIClient({
    authUrl: getAuthUrl('REST', grantType, salesforceSubdomain),
    baseUrl: getApiUrl('REST', salesforceSubdomain),
    requestConfig: getRequestConfig(),
    apiVersion: apiVersion ?? DEFAULT_API_VERSION,
  })

  return { salesforceClient, fields, settings, pathwayId, activityId }
}
