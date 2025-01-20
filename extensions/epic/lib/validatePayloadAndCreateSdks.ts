import {
  type NewActivityPayload,
  validate,
  type Pathway,
  type Patient,
} from '@awell-health/extensions-core'
import z from 'zod'
import { SettingsValidationSchema } from '../settings'
import { type Activity } from '@awell-health/extensions-core/dist/types/Activity'
import { EpicFhirR4Client } from './api/FhirR4'

type ValidatePayloadAndCreateSdks = <
  T extends z.ZodTypeAny,
  P extends NewActivityPayload<any, any>,
>(args: {
  fieldsSchema: T
  payload: P
}) => Promise<{
  epicFhirR4Sdk: EpicFhirR4Client
  fields: z.infer<(typeof args)['fieldsSchema']>
  settings: z.infer<typeof SettingsValidationSchema>
  pathway: Pathway
  patient: Patient
  activity: Activity
}>

export const validatePayloadAndCreateSdks: ValidatePayloadAndCreateSdks =
  async ({ fieldsSchema, payload }) => {
    const { settings, fields } = validate({
      schema: z.object({
        fields: fieldsSchema,
        settings: SettingsValidationSchema,
      }),
      payload,
    })

    const { patient, pathway, activity } = payload

    const epicFhirR4Sdk = new EpicFhirR4Client(settings)

    return {
      epicFhirR4Sdk,
      settings,
      fields,
      patient,
      pathway,
      activity,
    }
  }
