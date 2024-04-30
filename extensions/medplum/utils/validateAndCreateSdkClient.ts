import {
  type NewActivityPayload,
  type Patient,
  validate,
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
    }),
    payload,
  })

  const { patient, activity } = payload

  const medplumSdk = new MedplumClient({
    clientId,
  })

  await medplumSdk.startClientLogin(clientId, clientSecret)

  return { medplumSdk, fields, settings, patient, activity }
}
