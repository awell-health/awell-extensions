import {
  type NewActivityPayload,
  validate,
  type Pathway,
  type Patient,
} from '@awell-health/extensions-core'
import z from 'zod'
import { SettingsValidationSchema } from '../settings'
import { type Activity } from '@awell-health/extensions-core/dist/types/Activity'
import { AirtopClient } from '@airtop/sdk'

type ValidatePayloadAndCreateSdk = <
  T extends z.ZodTypeAny,
  P extends NewActivityPayload<any, any>,
>(args: {
  fieldsSchema: T
  payload: P
}) => Promise<{
  airtopSdk: AirtopClient
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
      settings: SettingsValidationSchema,
    }),
    payload,
  })

  const { patient, pathway, activity } = payload

  const airtopSdk = new AirtopClient({
    apiKey: settings.apiKey,
  })

  return {
    airtopSdk,
    settings,
    fields,
    patient,
    pathway,
    activity,
  }
}
