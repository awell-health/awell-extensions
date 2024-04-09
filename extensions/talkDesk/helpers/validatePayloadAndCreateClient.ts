import { validate } from '@awell-health/extensions-core'
import z from 'zod'
import { baseURLs, getAuthUrl, scope } from '../api/apiConfig'
import { TalkdeskAPIClient } from '../api/talkdeskClient'
import { SettingsValidationSchema } from '../settings'

type ValidateAndCreateClient = <T extends z.ZodTypeAny>(args: {
  fieldsSchema: T
  payload: unknown
}) => Promise<{
  client: TalkdeskAPIClient
  fields: z.infer<(typeof args)['fieldsSchema']>
  settings: z.infer<typeof SettingsValidationSchema>
}>

export const validatePayloadAndCreateClient: ValidateAndCreateClient = async ({
  fieldsSchema,
  payload,
}) => {
  const {
    settings: { clientId, clientSecret, region, talkDeskAccountName },
    fields,
    settings,
  } = validate({
    schema: z.object({
      fields: fieldsSchema,
      settings: SettingsValidationSchema,
    }),
    payload,
  })

  const client = new TalkdeskAPIClient({
    authUrl: getAuthUrl(region, talkDeskAccountName),
    requestConfig: {
      client_id: clientId,
      client_secret: clientSecret,
      scope,
    },
    baseUrl: baseURLs[region],
  })

  return { client, fields, settings }
}
