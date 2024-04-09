import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { HealthieError, mapHealthieToActivityError } from '../../errors'
import { getSdk } from '../../gql/sdk'
import { initialiseClient } from '../../graphqlClient'
import { type settings } from '../../settings'
import { dataPoints, fields } from './config'

export const createAppointment: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createAppointment',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create 1:1 appointment',
  description: 'Create a 1:1 appointment in Healthie.',
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = payload
    const {
      patientId,
      appointmentTypeId,
      datetime,
      contactTypeId,
      otherPartyId,
    } = fields
    try {
      const client = initialiseClient(settings)
      if (client !== undefined) {
        const sdk = getSdk(client)
        const { data } = await sdk.createAppointment({
          appointment_type_id: appointmentTypeId,
          contact_type: contactTypeId,
          other_party_id: otherPartyId,
          datetime,
          user_id: patientId,
        })
        await onComplete({
          data_points: {
            appointmentId: data.createAppointment?.appointment?.id,
          },
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
