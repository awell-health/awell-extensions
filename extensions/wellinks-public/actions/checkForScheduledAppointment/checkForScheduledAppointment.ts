import {
  type Field,
  FieldType,
  type Action,
  type DataPointDefinition,
} from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { getSdk } from '../../gql/wellinksSdk'
import { initialiseClient } from '../../api/clients/wellinksGraphqlClient'
import { type settings } from '../../config/settings'
import { isNil } from 'lodash'

const fields = {
  appointmentTypeId: {
    id: 'appointmentTypeId',
    label: 'Appointment Type ID',
    description: 'ID of the Appointment Type to look for',
    type: FieldType.STRING,
    required: true,
  },
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: 'The ID of the patiet to check an override for.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

const dataPoints = {
  appointmentScheduled: {
    key: 'appointmentScheduled',
    valueType: 'boolean',
  },
} satisfies Record<string, DataPointDefinition>

export const checkForScheduledAppointment: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'checkForScheduledAppointment',
  category: Category.SCHEDULING,
  title: 'Check for a Scheduled Appointment',
  description:
    'Check that a patient has an appointment of a certain type scheduled in the future',
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = payload
    const { patientId, appointmentTypeId } = fields

    try {
      const client = initialiseClient(settings)

      if (!isNil(client)) {
        const sdk = getSdk(client)
        const { data } = await sdk.getScheduledAppointments({
          user_id: patientId,
          appointment_type_id: appointmentTypeId,
          status: '',
        })

        if (!isNil(data.appointments)) {
          if (data.appointments.length > 0) {
            await onComplete({
              data_points: {
                appointmentScheduled: 'true',
              },
            })
          } else {
            await onComplete({
              data_points: {
                appointmentScheduled: 'false',
              },
            })
          }
        } else {
          await onError({
            events: [
              {
                date: new Date().toISOString(),
                text: {
                  en: 'There was an error in getting Appointments from Healthie',
                },
                error: {
                  category: 'SERVER_ERROR',
                  message: 'Appointments returned null',
                },
              },
            ],
          })
        }
      } else {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: {
                en: 'There was in error in setting up the GraphQL Client',
              },
              error: {
                category: 'SERVER_ERROR',
                message: 'Error initializing GraphQL Client',
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
            text: { en: 'There was in error processing the Charting Items' },
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
