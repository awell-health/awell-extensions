import { validate } from '@awell-health/extensions-core'
import z from 'zod'
import { SettingsValidationSchema } from '../../settings'
import { HealthieSdk } from './genql'
import { getSdk } from './graphql-codegen/generated/sdk'
import { initialiseClient } from './graphql-codegen/graphqlClient'

type ValidatePayloadAndCreateSdk = <T extends z.ZodTypeAny>(args: {
  fieldsSchema: T
  payload: unknown
}) => Promise<{
  /**
   * @deprecated DO NOT USE
   * DO NOT USE
   */
  sdk: ReturnType<typeof getSdk>
  healthieSdk: HealthieSdk
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

  /**
   * Old sdk, generated with graphql-codegen
   */
  const deprecatedSdk = getSdk(client)

  /**
   * New sdk, generated with GenQL
   */
  const healthieSdk = new HealthieSdk(settings)

  return { settings, fields, sdk: deprecatedSdk, healthieSdk }
}
