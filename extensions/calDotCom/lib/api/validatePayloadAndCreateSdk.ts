import {
  type NewActivityPayload,
  validate,
  type Pathway,
  type Patient,
} from '@awell-health/extensions-core'
import z from 'zod'
import { SettingsValidationSchema } from '../../settings'
import { type Activity } from '@awell-health/extensions-core/dist/types/Activity'
import { CalV2ApiClient } from './v2/client'

type ValidatePayloadAndCreateSdk = <
  T extends z.ZodTypeAny,
  P extends NewActivityPayload<any, any>,
>(args: {
  fieldsSchema: T
  payload: P
}) => Promise<{
  calv2Client: CalV2ApiClient
  fields: z.infer<T>
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
      settings: SettingsValidationSchema,
    }),
    payload,
  })

  const { patient, pathway, activity } = payload

  const calv2Client = new CalV2ApiClient({
    baseUrl: 'https://api.cal.com/v2',
    apiKey: settings.apiKey,
    calApiVersion: '2024-08-13',
  })

  return {
    calv2Client,
    settings,
    fields,
    patient,
    pathway,
    activity,
  }
}
