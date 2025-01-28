import {
  type NewActivityPayload,
  validate,
  type Pathway,
  type Patient,
} from '@awell-health/extensions-core'
import z from 'zod'
import { type Activity } from '@awell-health/extensions-core/dist/types/Activity'

type ValidatePayloadAndCreateSdk = <
  T extends z.ZodTypeAny,
  P extends NewActivityPayload<any, any>,
>(args: {
  fieldsSchema: T
  payload: P
}) => Promise<{
  fields: z.infer<(typeof args)['fieldsSchema']>
  settings: Record<string, never>
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
      settings: z.object({}),
      pathway: z.object({
        id: z.string(),
        definition_id: z.string(),
      }),
      activity: z.object({ id: z.string() }),
      patient: z.object({ id: z.string() }),
    }),
    payload,
  })

  const { patient, pathway, activity } = payload

  return {
    fields,
    settings,
    patient,
    pathway,
    activity,
  }
}
