import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import {
  HealthieError,
  mapHealthieToActivityError,
} from '../../lib/sdk/graphql-codegen/errors'
import { getSdk } from '../../lib/sdk/graphql-codegen/generated/sdk'
import { initialiseClient } from '../../lib/sdk/graphql-codegen/graphqlClient'
import { type settings } from '../../settings'
import { convertDate } from '../../lib/validation/dateValidation'
import { dataPoints, fields } from './config'

export const getAppointment: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getAppointment',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get appointment',
  description: 'Retrieve the details of an appointment in Healthie.',
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = payload
    const { appointmentId } = fields
    try {
      const client = initialiseClient(settings)
      if (client !== undefined) {
        const sdk = getSdk(client)
        const { data } = await sdk.getAppointment({
          id: appointmentId,
        })
        const date = convertDate(data.appointment?.date)
        await onComplete({
          data_points: {
            appointmentTypeId: data.appointment?.appointment_type?.id,
            appointmentTypeName: data.appointment?.appointment_type?.name,
            contactType: data.appointment?.contact_type,
            date,
            patientId: data?.appointment?.user?.id,
            appointmentStatus: data.appointment?.pm_status,
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
