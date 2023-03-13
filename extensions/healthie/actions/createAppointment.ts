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
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: 'The patient identifier',
    type: FieldType.STRING,
  },
  datetime: {
    id: 'datetime',
    label: 'Appointment date / time',
    description: 'The datetime of the appointment in ISO8601 format',
    type: FieldType.STRING,
  },
  appointmentTypeId: {
    id: 'appointmentTypeId',
    label: 'Appointment type ID',
    description: 'The ID of the appointment type',
    type: FieldType.STRING,
  },
} satisfies Record<string, Field>

const dataPoints = {
  appointmentId: {
    key: 'appointmentId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const createAppointment: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createAppointment',
  category: 'Healthie API',
  title: 'Create an appointment',
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = payload
    const { patientId, appointmentTypeId, datetime } = fields
    const client = initialiseClient(settings)
    if (client !== undefined) {
      const sdk = getSdk(client)
      const { data } = await sdk.createAppointment({
        appointment_type_id: appointmentTypeId,
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
  },
}
