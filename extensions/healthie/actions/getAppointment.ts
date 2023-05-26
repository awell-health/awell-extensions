import {
  FieldType,
  type Action,
  type DataPointDefinition,
  type Field,
  Category,
} from '@awell-health/awell-extensions-types'
import { getSdk } from '../gql/sdk'
import { initialiseClient } from '../graphqlClient'
import { type settings } from '../settings'
import { convertDate } from '../validation/dateValidation'

const fields = {
  appointmentId: {
    id: 'appointmentId',
    label: 'Appointment ID',
    description: 'The identifier of the appointment you want to retrieve.',
    type: FieldType.STRING,
  },
} satisfies Record<string, Field>

const dataPoints = {
  date: {
    key: 'date',
    valueType: 'date',
  },
  appointmentTypeId: {
    key: 'appointmentTypeId',
    valueType: 'string',
  },
  appointmentTypeName: {
    key: 'appointmentTypeName',
    valueType: 'string',
  },
  contactType: {
    key: 'contactType',
    valueType: 'string',
  },
  patientId: {
    key: 'patientId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

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
  },
}
