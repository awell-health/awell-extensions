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
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: 'The ID of the patient to check chats for.',
    type: FieldType.STRING,
    required: true,
  },
  coachId: {
    id: 'coachId',
    label: 'Coach ID',
    description: 'The ID of the coach to check chats for.',
    type: FieldType.STRING,
    required: true,
  },
  appointmentTime: {
    id: 'appointmentTime',
    label: 'Appointment Time',
    description: 'The appointment time to check against',
    type: FieldType.DATE,
    required: true,
  },
} satisfies Record<string, Field>

const dataPoints = {
  messageSent: {
    key: 'messageSent',
    valueType: 'boolean',
  },
} satisfies Record<string, DataPointDefinition>

export const checkForChat: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'checkForChat',
  category: Category.SCHEDULING,
  title: 'Check for Messages after Appointment',
  description:
    'Checks that a message has been sent 24 hours after the given Appointment',
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = payload
    const { patientId, coachId, appointmentTime } = fields
    try {
      const client = initialiseClient(settings)

      if (!isNil(client)) {
        const sdk = getSdk(client)
        const { data } = await sdk.getConversationMemberships({
          client_id: patientId,
        })

        if (!isNil(data.conversationMemberships)) {
          const conversationMemberships = data.conversationMemberships.filter(
            (conversation) => conversation?.convo?.dietitian_id === coachId
          )
          for (const conversation of conversationMemberships) {
            // check if dates are within 24 hours of each other

            if (
              areDatesMoreThanADayApart(
                new Date(conversation?.convo?.updated_at ?? ''),
                new Date(appointmentTime ?? '')
              )
            ) {
              await onComplete({
                data_points: {
                  messageSent: 'true',
                },
              })
              return
            }
          }
          await onComplete({
            data_points: {
              messageSent: 'false',
            },
          })
        } else {
          await onError({
            events: [
              {
                date: new Date().toISOString(),
                text: {
                  en: 'conversationMemberships returned null or undefined',
                },
                error: {
                  category: 'SERVER_ERROR',
                  message: 'conversationMemberships returned null or undefined',
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
            text: { en: 'There was in error checking for a recent Chat' },
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

function areDatesMoreThanADayApart(date1: Date, date2: Date): boolean {
  const oneDay = 1000 * 60 * 60 * 24
  return date1.getTime() > date2.getTime() + oneDay
}
