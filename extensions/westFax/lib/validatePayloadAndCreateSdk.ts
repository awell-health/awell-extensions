import {
  type NewActivityPayload,
  validate,
  type Pathway,
  type Patient,
} from '@awell-health/extensions-core'
import z from 'zod'
import { SettingsValidationSchema } from '../settings'
import { type Activity } from '@awell-health/extensions-core/dist/types/Activity'
import { WestFaxApiClient } from './api/client'

type ValidatePayloadAndCreateSdk = <
  T extends z.ZodTypeAny,
  P extends NewActivityPayload<any, any>,
>(args: {
  fieldsSchema: T
  payload: P
}) => Promise<{
  westFaxSdk: WestFaxApiClient
  fields: z.infer<(typeof args)['fieldsSchema']>
  settings: z.infer<typeof SettingsValidationSchema>
  pathway: Pathway
  patient: Patient
  activity: Activity
}>

export const validatePayloadAndCreateSdk: ValidatePayloadAndCreateSdk = async ({
  fieldsSchema,
  payload,
}) => {
  const { settings, fields } = validate({
    schema: z.object({
      fields: fieldsSchema,
      settings: SettingsValidationSchema.extend({
        productId: z
          .string()
          .min(1, 'Product ID is required to use the WestFax API'),
      }),
    }),
    payload,
  })

  const { patient, pathway, activity } = payload

  const baseUrl = `https://api2.westfax.com/REST`

  const westFaxSdk = new WestFaxApiClient({
    baseUrl,
    username: settings.username,
    password: settings.password,
    productId: settings.productId,
  })

  return {
    westFaxSdk,
    settings,
    fields,
    patient,
    pathway,
    activity,
  }
}
