import {
  FieldType,
  type Action,
  type DataPointDefinition,
  type Field,
} from '../../../lib/types'
import { getSdk } from '../gql/sdk'
import { initialiseClient } from '../graphqlClient'
import { type settings } from '../settings'

const fields = {
  appointmentId: {
    id: 'appointmentId',
    label: 'Appointment ID',
    description: 'The identifier of the appointment',
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
} satisfies Record<string, DataPointDefinition>

export const getAppointment: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getAppointment',
  category: 'Healthie API',
  title: 'Retrieve an appointment',
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = payload
    const { appointmentId } = fields
    const client = initialiseClient(settings)
    if (client !== undefined) {
      const sdk = getSdk(client)
      const { data } = await sdk.getAppointment({
        id: appointmentId,
      })
      await onComplete({
        data_points: {
          appointmentTypeId: data.appointment?.appointment_type?.id,
          appointmentTypeName: data.appointment?.appointment_type?.name,
          contactType: data.appointment?.contact_type,
          date: data.appointment?.date,
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
  },
}
