import {
  type NewActivityPayload,
  validate,
  type Pathway,
  type Patient,
} from '@awell-health/extensions-core'
import z from 'zod'
import { SettingsValidationSchema } from '../settings'
import { type Activity } from '@awell-health/extensions-core/dist/types/Activity'
import { FreshdeskApiClient } from './api/client'

type ValidatePayloadAndCreateSdk = <
  T extends z.ZodTypeAny,
  P extends NewActivityPayload<any, any>,
>(args: {
  fieldsSchema: T
  payload: P
}) => Promise<{
  freshdeskSdk: FreshdeskApiClient
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

  const baseUrl = `https://${settings.domain}.freshdesk.com/api/v2`

  const freshdeskSdk = new FreshdeskApiClient({
    baseUrl,
    apiKey: settings.apiKey,
  })

  return {
    freshdeskSdk,
    settings,
    fields,
    patient,
    pathway,
    activity,
  }
}
