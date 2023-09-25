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
    description: 'The ID of the patiet to check an override for.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

const dataPoints = {
  activeOverride: {
    key: 'activeOverride',
    valueType: 'boolean',
  },
  overrideDate: {
    key: 'overrideDate',
    valueType: 'date',
  },
} satisfies Record<string, DataPointDefinition>

export const checkForOverride: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'checkForOverride',
  category: Category.SCHEDULING,
  title: 'Check if a patient has an active Override for Scheduling Reminders',
  description:
    'Check if a patient has an active Override form in Healthie for Scheduling Reminders.',
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = payload
    const { patientId } = fields
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
            settings.startSendingRemindersQuestions ?? ''
          )
          if (active.active) {
            await onComplete({
              data_points: {
                activeOverride: 'true',
                overrideDate: active.date?.toISOString(),
              },
            })
          } else {
            await onComplete({
              data_points: {
                activeOverride: 'false',
                overrideDate: null,
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
  startDateQuestionId: string
): { active: boolean; date: Date | null } {
  if (isNil(data)) {
    return {
      active: false,
      date: null,
    }
  } else {
    const overrideForms = data.filter(
      (value) =>
        value?.form_answer_group?.form_answers.find(
          (value) => value.custom_module_id === eventTypeQuestionId
        )?.answer === 'Override Scheduling Reminder Automations'
    )

    overrideForms.sort(
      (a, b) =>
        new Date(b?.created_at ?? '').getTime() -
        new Date(a?.created_at ?? '').getTime()
    )
    const latestOverrideForm = overrideForms[0]
    const overrideEndDate =
      latestOverrideForm?.form_answer_group?.form_answers.find(
        (value) => value.custom_module_id === startDateQuestionId
      )?.answer
    const now = new Date()

    if (!isNil(overrideEndDate)) {
      return {
        active:
          overrideEndDate !== null &&
          overrideEndDate !== undefined &&
          new Date(overrideEndDate) > now,
        date: new Date(overrideEndDate),
      }
    } else {
      return {
        active: false,
        date: null,
      }
    }
  }
}
