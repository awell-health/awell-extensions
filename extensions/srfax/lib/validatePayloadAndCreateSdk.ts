import {
  validate,
  type NewActivityPayload,
  type Pathway,
  type Patient,
} from '@awell-health/extensions-core'
import z from 'zod'
import { SettingsValidationSchema } from '../settings'
import { type Activity } from '@awell-health/extensions-core/dist/types/Activity'
import { SrfaxApiClient } from './api/client'

type ValidatePayloadAndCreateSdk = <
  T extends z.ZodTypeAny,
  P extends NewActivityPayload<any, any>,
>(args: {
  fieldsSchema: T
  payload: P
}) => Promise<{
  srfaxSdk: SrfaxApiClient
  fields: z.infer<(typeof args)['fieldsSchema']>
  settings: z.infer<typeof SettingsValidationSchema>
  pathway: Pathway
  patient: Patient
  activity: Activity
}>

export const baseUrl = 'https://www.srfax.com/SRF_SecWebSvc.php'

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

  const srfaxSdk = new SrfaxApiClient({
    baseUrl: settings.baseUrl && settings.baseUrl.length > 0 ? settings.baseUrl : baseUrl,
    accountId: settings.accountId,
    password: settings.password,
  })

  return {
    srfaxSdk,
    settings,
    fields,
    patient,
    pathway,
    activity,
  }
}
