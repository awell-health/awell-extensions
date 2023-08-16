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

const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: 'The ID of the patient you want to create an appointment for.',
    type: FieldType.STRING,
    required: true,
  },
  otherPartyId: {
    id: 'otherPartyId',
    label: 'Provider ID',
    description:
      'The ID of the provider the appointment is with. If none provided, the user the API key is associated with will be used.',
    type: FieldType.STRING,
  },
  contactTypeId: {
    id: 'contactTypeId',
    label: 'Contact type ID',
    description: 'How the appointment will be conducted.',
    type: FieldType.STRING,
    required: true,
  },
  appointmentTypeId: {
    id: 'appointmentTypeId',
    label: 'Appointment type ID',
    description: 'The ID of the appointment type.',
    type: FieldType.STRING,
    required: true,
  },
  datetime: {
    id: 'datetime',
    label: 'Appointment date and time',
    description: 'The date and time of the appointment in ISO8601 format.',
    type: FieldType.STRING,
    required: true,
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
        /**
         * re-throw to be handled inside awell-extension-server
         */
        throw err
      }
    }
  },
}
