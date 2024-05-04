import {
  type NewActivityPayload,
  type Patient,
  validate,
  type Pathway,
} from '@awell-health/extensions-core'
import z from 'zod'
import { MedplumClient } from '@medplum/core'
import { SettingsValidationSchema } from '../settings'
import { type Activity } from '@awell-health/extensions-core/dist/types/Activity'

type ValidateAndCreateSdkClient = <
  T extends z.ZodTypeAny,
  P extends NewActivityPayload<any, any>
>(args: {
  fieldsSchema: T
  payload: P
}) => Promise<{
  medplumSdk: MedplumClient
  fields: z.infer<(typeof args)['fieldsSchema']>
  settings: z.infer<typeof SettingsValidationSchema>
  pathway: Pathway
  patient: Patient
  activity: Activity
}>

export const validateAndCreateSdkClient: ValidateAndCreateSdkClient = async ({
  fieldsSchema,
  payload,
}) => {
  const {
    settings: { clientId, clientSecret },
    fields,
    settings,
  } = validate({
    schema: z.object({
      fields: fieldsSchema,
      settings: SettingsValidationSchema,
      pathway: z.object({ id: z.string() }),
      activity: z.object({ id: z.string() }),
    }),
    payload,
  })

  const { patient, pathway, activity } = payload

  const medplumSdk = new MedplumClient({
    clientId,
  })

  await medplumSdk.startClientLogin(clientId, clientSecret)

  return { medplumSdk, fields, settings, patient, pathway, activity }
}
