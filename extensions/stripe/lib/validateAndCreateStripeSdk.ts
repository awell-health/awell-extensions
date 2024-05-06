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
import { isEmpty } from 'lodash'

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

  if (mode === 'LIVE' && isEmpty(liveModeSecretKey))
    throw new Error(
      'Stripe is in "live" mode but missing secret key for live mode.'
    )

  const stripe = new Stripe(
    mode === 'TEST' ? testModeSecretKey : (liveModeSecretKey as string)
  )

  return { stripe, fields, settings, patient, pathway, activity }
}
