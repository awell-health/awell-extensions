import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import {
  HealthieError,
  mapHealthieToActivityError,
} from '../../lib/sdk/graphql-codegen/errors'
import { getSdk } from '../../lib/sdk/graphql-codegen/generated/sdk'
import { initialiseClient } from '../../lib/sdk/graphql-codegen/graphqlClient'
import { mapHealthieGenderToIsoSex } from '../../lib/helpers'
import { type settings } from '../../settings'
import { validateGetPatient } from '../../lib/validation/getPatient.zod'
import { dataPoints, fields } from './config'

export const getPatient: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getPatient',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get patient',
  description: 'Retrieve the details of a patient in Healthie.',
  fields,
  dataPoints,
  previewable: true,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log({ meta, fields: payload.fields }, 'Processing getPatient')

    const { fields, settings } = payload
    const { patientId } = fields
    try {
      const client = initialiseClient(settings)
      if (client !== undefined) {
        const sdk = getSdk(client)
        const { data } = await sdk.getUser({ id: patientId })

        const {
          data: { dob, phoneNumber },
          events,
        } = validateGetPatient(data.user)

        await onComplete({
          data_points: {
            firstName: data.user?.first_name,
            lastName: data.user?.last_name,
            dob,
            email: data.user?.email,
            gender: data.user?.gender,
            isoSex: String(mapHealthieGenderToIsoSex(data.user?.gender)),
            phoneNumber,
            groupName: data.user?.user_group?.name,
            primaryProviderId: data.user?.dietitian_id,
          },
          events,
        })
      } else {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'API client requires an API url and API key' },
              error: {
                category: 'MISSING_SETTINGS',
                message: 'Missing api url or api key',
              },
            },
          ],
        })
      }
    } catch (err) {
      helpers.log({ meta, err }, 'error', err as Error)
      if (err instanceof HealthieError) {
        const errors = mapHealthieToActivityError(err.errors)
        await onError({
          events: errors,
        })
      } else {
        const error = err as Error
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'Healthie API reported an error' },
              error: {
                category: 'SERVER_ERROR',
                message: error.message,
              },
            },
          ],
        })
      }
    }
  },
}
