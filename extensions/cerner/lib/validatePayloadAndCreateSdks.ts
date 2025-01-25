import {
  type NewActivityPayload,
  validate,
  type Pathway,
  type Patient,
} from '@awell-health/extensions-core'
import z from 'zod'
import { SettingsValidationSchema } from '../settings'
import { type Activity } from '@awell-health/extensions-core/dist/types/Activity'
import { CernerR4APIClient } from './api/FhirR4'
import { constructCernerUrls } from './api/auth'

type ValidatePayloadAndCreateSdks = <
  T extends z.ZodTypeAny,
  P extends NewActivityPayload<any, any>,
>(args: {
  fieldsSchema: T
  payload: P
}) => Promise<{
  cernerFhirR4Sdk: CernerR4APIClient
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

    const { authUrl, r4BaseUrl } = constructCernerUrls(settings.tenantId)

    const cernerFhirR4Sdk = new CernerR4APIClient({
      authUrl,
      baseUrl: r4BaseUrl,
      requestConfig: {
        client_id: settings.clientId,
        client_secret: settings.clientSecret,
        scope: 'system/Patient.r',
      },
    })

    return {
      cernerFhirR4Sdk,
      settings,
      fields,
      patient,
      pathway,
      activity,
    }
  }
