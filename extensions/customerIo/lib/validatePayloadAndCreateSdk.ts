import {
  type NewActivityPayload,
  validate,
  type Pathway,
  type Patient,
} from '@awell-health/extensions-core'
import z from 'zod'
import { SettingsValidationSchema } from '../settings'
import { type Activity } from '@awell-health/extensions-core/dist/types/Activity'
import { CustomerioTrackApiClient } from './api'

type ValidatePayloadAndCreateSdks = <
  T extends z.ZodTypeAny,
  P extends NewActivityPayload<any, any>,
>(args: {
  fieldsSchema: T
  payload: P
}) => Promise<{
  customerIoTrackClient: CustomerioTrackApiClient
  fields: z.infer<(typeof args)['fieldsSchema']>
  settings: z.infer<typeof SettingsValidationSchema>
  pathway: Pathway
  patient: Patient
  activity: Activity
}>

export const validatePayloadAndCreateSdks: ValidatePayloadAndCreateSdks =
  async ({ fieldsSchema, payload }) => {
    const {
      settings: { siteId, apiKey },
      fields,
      settings,
    } = validate({
      schema: z.object({
        fields: fieldsSchema,
        settings: SettingsValidationSchema,
      }),
      payload,
    })

    const { patient, pathway, activity } = payload

    const customerIoTrackClient = new CustomerioTrackApiClient({
      siteId,
      apiKey,
    })

    return {
      customerIoTrackClient,
      fields,
      settings,
      patient,
      pathway,
      activity,
    }
  }
