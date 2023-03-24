import { isNil } from 'lodash'
import {
  FieldType,
  type Action,
  type Field,
} from '../../../lib/types'
import { Category } from '../../../lib/types/marketplace'
import { getSdk } from '../gql/sdk'
import { initialiseClient } from '../graphqlClient'
import { type settings } from '../settings'


const fields = {
  healthie_patient_id: {
    id: 'healthie_patient_id',
    label: 'Healthie Patient ID',
    description: 'The ID of the patient that should receive the form completion request.',
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
} satisfies Record<string, Field>

export const sendFormCompletionRequest: Action<
  typeof fields,
  typeof settings
> = {
  key: 'sendFormCompletionRequest',
  category: Category.INTEGRATIONS,
  title: 'Send form completion request',
  description: 'Send form completion request in Healthie.',
  fields,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = payload
    const { healthie_patient_id, form_id } = fields
    try {
      if (isNil(healthie_patient_id) || isNil(form_id)) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'Fields are missing' },
              error: {
                category: 'MISSING_FIELDS',
                message: '`healthie_patient_id` or `form_id` is missing',
              },
            },
          ],
        })
        return;
      }

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
            form: form_id
          }
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