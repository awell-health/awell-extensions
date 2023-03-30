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
    description: 'The ID of the patient you would like to create a charting note for.',
    type: FieldType.STRING,
    required: true,
  },
  form_id: {
    id: 'form_id',
    label: 'Form ID',
    description: 'The ID of the form you would like to create the charting note against.',
    type: FieldType.STRING,
    required: true,
  },
  note_content: {
    id: 'note_content',
    label: 'Note content',
    description: 'The content of the charting note.',
    type: FieldType.HTML,
    required: true,
  },
} satisfies Record<string, Field>

export const createChartingNote: Action<
  typeof fields,
  typeof settings
> = {
  key: 'createChartingNote',
  category: Category.INTEGRATIONS,
  title: 'Create charting note',
  description: 'Create charting note in Healthie.',
  fields,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = payload
    const { healthie_patient_id, form_id, note_content } = fields
    try {
      if (isNil(healthie_patient_id) || isNil(form_id) || isNil(note_content)) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'Fields are missing' },
              error: {
                category: 'MISSING_FIELDS',
                message: '`healthie_patient_id`, `form_id` or `note_content` is missing',
              },
            },
          ],
        })
        return;
      }

      const client = initialiseClient(settings)
      if (client !== undefined) {
        const sdk = getSdk(client)
        const { data } = await sdk.getFormTemplate({
          id: form_id
        })

        const moduleForm = data.customModuleForm;

        if (isNil(moduleForm)) {
          await onError({
            events: [
              {
                date: new Date().toISOString(),
                text: { en: "Form doesn't exist" },
                error: {
                  category: 'WRONG_INPUT',
                  message: `Form with id ${form_id} doesn't exist`,
                },
              },
            ],
          })
          return;
        }

        if (moduleForm.use_for_charting !== true) {
          await onError({
            events: [
              {
                date: new Date().toISOString(),
                text: { en: "Form isn't a charting form" },
                error: {
                  category: 'WRONG_DATA',
                  message: `Form with id ${form_id} cannot be used for charting`,
                },
              },
            ],
          })
          return;
        }

        const firstTextAreaField = moduleForm.custom_modules?.find(({ mod_type }) => mod_type === 'textarea')

        if (isNil(firstTextAreaField)) {
          await onError({
            events: [
              {
                date: new Date().toISOString(),
                text: { en: "Form doesn't have a question of type \"textarea\" (long text)." },
                error: {
                  category: 'WRONG_DATA',
                  message: `Form with id ${form_id}  doesn't have a "textarea" field`,
                },
              },
            ],
          })
          return;
        }

        await sdk.createFormAnswerGroup({
          input: {
            finished: true,
            custom_module_form_id: form_id,
            user_id: healthie_patient_id,
            form_answers: [
              {
                custom_module_id: firstTextAreaField.id,
                user_id: healthie_patient_id,
                answer: note_content
              }
            ]
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