import { type SettingsValues, validate } from '@awell-health/extensions-core'
import z from 'zod'
import { type settings, settingsValidationSchema } from '../../settings'
import { getSdk } from './generated/sdk'
import { initialiseClient } from './graphqlClient'

type ValidatePayloadAndCreateSdk = <T extends z.ZodTypeAny>(args: {
  fieldsSchema: T
  payload: unknown
}) => Promise<{
  sdk: ReturnType<typeof getSdk>
  fields: z.infer<(typeof args)['fieldsSchema']>
  settings: z.infer<typeof settingsValidationSchema>
}>

type ValidateWebhookPayloadAndCreateSdk = <T extends z.ZodTypeAny>(args: {
  payloadSchema: T
  payload: unknown
  settings: SettingsValues<typeof settings>
}) => Promise<{
  sdk: ReturnType<typeof getSdk>
  validatedPayload: z.infer<(typeof args)['payloadSchema']>
}>

export const validatePayloadAndCreateSdk: ValidatePayloadAndCreateSdk = async ({
  fieldsSchema,
  payload,
}) => {
  const { settings, fields } = validate({
    schema: z.object({
      fields: fieldsSchema,
      settings: settingsValidationSchema,
    }),
    payload,
  })

  const client = initialiseClient(settings)

  if (client === undefined)
    throw new Error('Healthie client cannot be undefined.')

  const sdk = getSdk(client)

  return { settings, fields, sdk }
}

export const validateWebhookPayloadAndCreateSdk: ValidateWebhookPayloadAndCreateSdk =
  async ({ payloadSchema, payload, settings }) => {
    const { payload: validatedPayload } = validate({
      schema: z.object({
        payload: payloadSchema,
      }),
      payload,
    })

    const client = initialiseClient(settings)

    if (client === undefined)
      throw new Error(
        'There was a problem creating the Healthie GraphQL API Client. Please check your extension settings to validate the API URL and API Key.'
      )

    const sdk = getSdk(client)

    return { validatedPayload, sdk }
  }
