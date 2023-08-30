import { HealthieError, mapHealthieToActivityError } from '../errors'
import {
  FieldType,
  type Action,
  type Field,
} from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { getSdk } from '../gql/sdk'
import { initialiseClient } from '../graphqlClient'
import { type settings } from '../settings'
import { FieldsSchema } from '../validation/sendFormCompletionRequest.zod'

const fields = {
  healthie_patient_id: {
    id: 'healthie_patient_id',
    label: 'Healthie Patient ID',
    description:
      'The ID of the patient that should receive the form completion request.',
    type: FieldType.STRING,
    required: true,
  },
  form_id: {
    id: 'form_id',
    label: 'Form ID',
    description: 'The ID of the form you would like the patient to complete.',
    type: FieldType.STRING,
    required: true,
  },
  is_recurring: {
    id: 'is_recurring',
    label: 'Is recurring',
    description: 'Set to true if the Form completion should be recurring.',
    type: FieldType.BOOLEAN,
    required: false,
  },
  frequency: {
    id: 'frequency',
    label: 'Frequency',
    description:
      'Required if "Is recurring" is set to true. Valid options are: Daily, Weekly, Monthly.',
    type: FieldType.STRING,
    required: false,
  },
  period: {
    id: 'period',
    label: 'Period',
    description: 'AM or PM.',
    type: FieldType.STRING,
    required: false,
  },
  hour: {
    id: 'hour',
    label: 'Hour',
    description:
      'For instance, if you want to trigger the completion request at 1:05 PM, use "1".',
    type: FieldType.NUMERIC,
    required: false,
  },
  minute: {
    id: 'minute',
    label: 'Minute',
    description:
      'For instance, if you want to trigger the completion request at 1:05 PM, use "5".',
    type: FieldType.NUMERIC,
    required: false,
  },
  weekday: {
    id: 'weekday',
    label: 'Weekday',
    description: 'Use the full weekday name, e.g. "Monday".',
    type: FieldType.STRING,
    required: false,
  },
  monthday: {
    id: 'monthday',
    label: 'Monthday',
    description: 'Number of the day of month, e.g. "27th".',
    type: FieldType.STRING,
    required: false,
  },
  recurrence_ends: {
    id: 'recurrence_ends',
    label: 'Recurrence ends',
    description: 'Set to true if the recurrence should have an end date.',
    type: FieldType.BOOLEAN,
    required: false,
  },
  ends_on: {
    id: 'ends_on',
    label: 'Ends on',
    description: 'Recurrence end date in the YYYY-MM-DD format.',
    type: FieldType.DATE,
    required: false,
  },
} satisfies Record<string, Field>

export const sendFormCompletionRequest: Action<typeof fields, typeof settings> =
  {
    key: 'sendFormCompletionRequest',
    category: Category.EHR_INTEGRATIONS,
    title: 'Send form completion request',
    description: 'Send a form completion request to a patient in Healthie.',
    fields,
    previewable: true,
    onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
      const { fields, settings } = payload
      try {
        const {
          healthie_patient_id,
          form_id,
          is_recurring,
          frequency,
          monthday,
          weekday,
          hour,
          minute,
          period,
          recurrence_ends,
          ends_on,
        } = FieldsSchema.parse(fields)

        const client = initialiseClient(settings)
        if (client !== undefined) {
          const sdk = getSdk(client)
          await sdk.createFormCompletionRequest({
            input: {
              /**
               * Although the Healthie API call allows sending form completion requests to multiple users per API call,
               * we decided that every action only sends one form completion request.
               * This heavily simplifies the logic and better fits our domain model.
               * If a user would like to send multiple form completion requests,
               * they you can just add multiple actions.
               */
              recipient_ids: healthie_patient_id,
              form: form_id,
              is_recurring: is_recurring ?? false,
              frequency,
              monthday,
              weekday,
              hour,
              minute,
              period,
              recurrence_ends,
              ends_on,
            },
          })

          await onComplete()
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
