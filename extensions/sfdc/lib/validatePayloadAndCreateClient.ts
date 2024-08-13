import { validate } from '@awell-health/extensions-core'
import z from 'zod'
import { SalesforceRestAPIClient } from '../api/client'
import { getApiUrl, getAuthUrl } from '../api/constants'
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
    settings: { salesforceSubdomain, clientId, clientSecret },
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

  const salesforceClient = new SalesforceRestAPIClient({
    authUrl: getAuthUrl('REST', salesforceSubdomain),
    baseUrl: getApiUrl('REST', salesforceSubdomain),
    requestConfig: {
      client_id: clientId,
      client_secret: clientSecret,
    },
  })

  return { salesforceClient, fields, settings, pathwayId, activityId }
}
