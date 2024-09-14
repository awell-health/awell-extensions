import {
  type NewActivityPayload,
  validate,
  type Pathway,
  type Patient,
} from '@awell-health/extensions-core'
import z from 'zod'
import { SettingsValidationSchema } from '../settings'
import { type Activity } from '@awell-health/extensions-core/dist/types/Activity'
import { Client } from '@hubspot/api-client'
import { HubSpotSMTPClient } from './smtpApi'
import { isEmpty } from 'lodash'

type ValidatePayloadAndCreateSdks = <
  T extends z.ZodTypeAny,
  P extends NewActivityPayload<any, any>
>(args: {
  fieldsSchema: T
  payload: P
}) => Promise<{
  hubSpotSdk: Client
  hubSpotSmtpSdk?: HubSpotSMTPClient
  fields: z.infer<(typeof args)['fieldsSchema']>
  settings: z.infer<typeof SettingsValidationSchema>
  pathway: Pathway
  patient: Patient
  activity: Activity
}>

export const validatePayloadAndCreateSdks: ValidatePayloadAndCreateSdks =
  async ({ fieldsSchema, payload }) => {
    const {
      settings: { accessToken, smtpPassword, smtpUsername },
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

    const hubSpotSdk = new Client({
      accessToken,
    })

    const getSmptClient = (): HubSpotSMTPClient | undefined => {
      if (isEmpty(smtpPassword) || isEmpty(smtpUsername)) {
        return undefined
      }

      return new HubSpotSMTPClient({
        username: smtpUsername as string,
        password: smtpPassword as string,
      })
    }

    const hubSpotSmtpSdk = getSmptClient()

    return {
      hubSpotSdk,
      hubSpotSmtpSdk,
      fields,
      settings,
      patient,
      pathway,
      activity,
    }
  }
