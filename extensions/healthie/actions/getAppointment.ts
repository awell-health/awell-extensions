import {
  FieldType,
  type Action,
  type DataPointDefinition,
  type Field,
} from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { HealthieError, mapHealthieToActivityError } from '../errors'
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
      if (err instanceof HealthieError) {
        const errors = mapHealthieToActivityError(err.errors)
        await onError({
          events: errors,
        })
      } else {
        /**
         * re-throw to be handled inside awell-extension-server
         */
        throw err
      }
    }
  },
}
