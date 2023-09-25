import {
  type Field,
  FieldType,
  type Action,
  type DataPointDefinition,
} from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type GetChartingItemsQuery, getSdk } from '../../gql/wellinksSdk'
import { initialiseClient } from '../../api/clients/wellinksGraphqlClient'
import { type settings } from '../../config/settings'
import { isNil } from 'lodash'

const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: 'The ID of the patient to check an override for.',
    type: FieldType.STRING,
    required: true,
  },
  appointmentTime: {
    id: 'appointmentTime',
    label: 'Appointment Time',
    description: 'The time of the appointment to check against.',
    type: FieldType.DATE,
    required: true,
  },
} satisfies Record<string, Field>

const dataPoints = {
  activeOverride: {
    key: 'activeOverride',
    valueType: 'boolean',
  },
} satisfies Record<string, DataPointDefinition>

export const checkForCheckInOverride: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'checkForCheckInOverride',
  category: Category.SCHEDULING,
  title: 'Check if a patient has an active Override for Check In Automation',
  description:
    'Check if a patient has an Override form in Healthie for Check In Automation created after the appointment time.',
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = payload
    const { patientId, appointmentTime } = fields
    try {
      const client = initialiseClient(settings)

      if (!isNil(client)) {
        const sdk = getSdk(client)
        const { data } = await sdk.getChartingItems({
          user_id: patientId,
          custom_module_form_id: settings.memberEventFormId,
        })

        if (!isNil(data.chartingItems)) {
          const active = parseListOfForms(
            data.chartingItems,
            settings.selectEventTypeQuestion ?? '',
            settings.startSendingRemindersQuestions ?? '',
            appointmentTime ?? ''
          )
          if (active) {
            await onComplete({
              data_points: {
                activeOverride: 'true',
              },
            })
          } else {
            await onComplete({
              data_points: {
                activeOverride: 'false',
              },
            })
          }
        } else {
          await onError({
            events: [
              {
                date: new Date().toISOString(),
                text: {
                  en: 'There was in error processing the Charting Items',
                },
                error: {
                  category: 'WRONG_DATA',
                  message: 'Charting Items returned Null',
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

function parseListOfForms(
  data: GetChartingItemsQuery['chartingItems'],
  eventTypeQuestionId: string,
  startDateQuestionId: string,
  appointmentTime: string
): boolean {
  if (
    isNil(data) ||
    isNil(appointmentTime) ||
    isNil(eventTypeQuestionId) ||
    isNil(startDateQuestionId)
  ) {
    return false
  } else {
    const overrideForms = data.filter(
      (value) =>
        value?.form_answer_group?.form_answers.find(
          (value) => value.custom_module_id === eventTypeQuestionId
        )?.answer === 'Override check-in automation'
    )

    for (const form of overrideForms) {
      if (!isNil(form) && !isNil(form.created_at)) {
        if (new Date(form.created_at) > new Date(appointmentTime)) {
          return true
        }
      }
    }
    return false
  }
}
