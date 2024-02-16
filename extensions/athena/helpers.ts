import { validate } from '@awell-health/extensions-core'
import z from 'zod'
import { AthenaAPIClient } from './api/client'
import { SettingsValidationSchema } from './settings'

type ValidateAndCreateClient = <T extends z.ZodTypeAny>(args: {
  fieldsSchema: T
  payload: unknown
}) => Promise<{
  client: AthenaAPIClient
  fields: z.infer<(typeof args)['fieldsSchema']>
}>

export const validatePayloadAndCreateClient: ValidateAndCreateClient = async ({
  fieldsSchema,
  payload,
}) => {
  const {
    settings: { client_id, client_secret, auth_url, api_url, scope },
    fields,
  } = validate({
    schema: z.object({
      fields: fieldsSchema,
      settings: SettingsValidationSchema,
    }),
    payload,
  })

  const client = new AthenaAPIClient({
    authUrl: auth_url,
    requestConfig: {
      client_id,
      client_secret,
      scope,
      // @ts-expect-error ignore
      grant_type: 'client_credentials',
    },
    baseUrl: api_url,
  })

  return { client, fields }
}
