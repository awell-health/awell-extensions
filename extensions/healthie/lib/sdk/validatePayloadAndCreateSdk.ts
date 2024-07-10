import { validate } from '@awell-health/extensions-core'
import z from 'zod'
import { SettingsValidationSchema } from '../../settings'
import { getSdk } from './generated/sdk'
import { initialiseClient } from './graphqlClient'

type ValidatePayloadAndCreateSdk = <T extends z.ZodTypeAny>(args: {
  fieldsSchema: T
  payload: unknown
}) => Promise<{
  sdk: ReturnType<typeof getSdk>
  fields: z.infer<(typeof args)['fieldsSchema']>
  settings: z.infer<typeof SettingsValidationSchema>
}>

export const validatePayloadAndCreateSdk: ValidatePayloadAndCreateSdk = async ({
  fieldsSchema,
  payload,
}) => {
  const { settings, fields } = validate({
    schema: z.object({
      fields: fieldsSchema,
      settings: SettingsValidationSchema,
    }),
    payload,
  })

  const client = initialiseClient(settings)

  if (client === undefined)
    throw new Error('Healthie client cannot be undefined.')

  const sdk = getSdk(client)

  return { settings, fields, sdk }
}
