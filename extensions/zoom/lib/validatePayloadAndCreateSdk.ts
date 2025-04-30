import {
  type NewActivityPayload,
  validate,
  type Pathway,
  type Patient,
} from '@awell-health/extensions-core'
import z from 'zod'
import { SettingsValidationSchema } from '../settings'
import { type Activity } from '@awell-health/extensions-core/dist/types/Activity'
import { ZoomApiClient } from '../api/client'
import { ZOOM_AUTH_URL, ZOOM_API_URL } from './constants'

type ValidatePayloadAndCreateSdk = <
  T extends z.ZodTypeAny,
  P extends NewActivityPayload<any, any>,
>(args: {
  fieldsSchema: T
  payload: P
}) => Promise<{
  zoomSdk: ZoomApiClient
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

  const zoomSdk = new ZoomApiClient({
    baseUrl: ZOOM_API_URL,
    authUrl: ZOOM_AUTH_URL,
    accountId: settings.accountId,
    clientId: settings.clientId,
    clientSecret: settings.clientSecret,
  })

  return {
    zoomSdk,
    settings,
    fields,
    patient,
    pathway,
    activity,
  }
}
