import {
  type NewActivityPayload,
  type Patient,
  validate,
  type Pathway,
} from '@awell-health/extensions-core'
import z from 'zod'
import { BrazeClient } from './api/client'
import { SettingsValidationSchema } from '../settings'
import { type Activity } from '@awell-health/extensions-core/dist/types/Activity'
import { isNil, isEmpty } from 'lodash'

type ValidateAndCreateBrazeClient = <
  T extends z.ZodTypeAny,
  P extends NewActivityPayload<any, any>,
>(args: {
  fieldsSchema: T
  payload: P
  requiresAppId?: boolean
}) => Promise<{
  brazeClient: BrazeClient
  appId: string
  fields: z.infer<(typeof args)['fieldsSchema']>
  settings: z.infer<typeof SettingsValidationSchema>
  pathway: Pathway
  patient: Patient
  activity: Activity
}>

export const validateAndCreateClient: ValidateAndCreateBrazeClient = async ({
  fieldsSchema,
  payload,
  requiresAppId = true,
}) => {
  const {
    settings: { appId: settingsAppId, apiKey, baseUrl },
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
  const { appId: fieldsAppId } = payload.fields

  // App ID via fields takes precedence over app ID via settings
  const appId =
    isNil(fieldsAppId) || isEmpty(fieldsAppId) ? settingsAppId : fieldsAppId

  if (requiresAppId && (isNil(appId) || isEmpty(appId))) {
    throw new Error(
      'App ID is required. Either provide it via the extension settings or the action field.',
    )
  }

  const brazeClient = new BrazeClient({
    apiKey,
    baseUrl,
  })

  return {
    brazeClient,
    appId,
    fields,
    settings,
    patient,
    pathway,
    activity,
  }
}
