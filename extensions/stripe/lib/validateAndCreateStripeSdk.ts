import {
  type NewActivityPayload,
  type Patient,
  validate,
  type Pathway,
} from '@awell-health/extensions-core'
import z from 'zod'
import Stripe from '../api/client'
import { SettingsValidationSchema } from '../settings'
import { type Activity } from '@awell-health/extensions-core/dist/types/Activity'

type ValidateAndCreateStripeSdk = <
  T extends z.ZodTypeAny,
  P extends NewActivityPayload<any, any>
>(args: {
  fieldsSchema: T
  payload: P
}) => Promise<{
  stripe: Stripe
  fields: z.infer<(typeof args)['fieldsSchema']>
  settings: z.infer<typeof SettingsValidationSchema>
  pathway: Pathway
  patient: Patient
  activity: Activity
}>

export const validateAndCreateStripeSdk: ValidateAndCreateStripeSdk = async ({
  fieldsSchema,
  payload,
}) => {
  const {
    settings: { testModeSecretKey, liveModeSecretKey, mode },
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

  const stripe = new Stripe(
    mode === 'Test' ? testModeSecretKey : (liveModeSecretKey )
  )

  return { stripe, fields, settings, patient, pathway, activity }
}
