import { validate } from '@awell-health/extensions-core'
import z from 'zod'
import { MedplumClient } from '@medplum/core'
import { SettingsValidationSchema } from '../settings'

type ValidateAndCreateSdkClient = <T extends z.ZodTypeAny>(args: {
  fieldsSchema: T
  payload: unknown
}) => Promise<{
  medplumSdk: MedplumClient
  fields: z.infer<(typeof args)['fieldsSchema']>
  settings: z.infer<typeof SettingsValidationSchema>
}>

export const validateAndCreateSdkClient: ValidateAndCreateSdkClient = async ({
  fieldsSchema,
  payload,
}) => {
  const {
    settings: { clientId, clientSecret },
    fields,
    settings,
  } = validate({
    schema: z.object({
      fields: fieldsSchema,
      settings: SettingsValidationSchema,
    }),
    payload,
  })

  const medplumSdk = new MedplumClient({
    clientId,
  })

  await medplumSdk.startClientLogin(clientId, clientSecret)

  return { medplumSdk, fields, settings }
}
