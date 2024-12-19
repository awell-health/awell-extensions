import { isNil } from 'lodash'
import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { getSdk } from '../../lib/sdk/graphql-codegen/generated/sdk'
import { initialiseClient } from '../../lib/sdk/graphql-codegen/graphqlClient'
import { type settings } from '../../settings'
import {
  HealthieError,
  mapHealthieToActivityError,
} from '../../lib/sdk/graphql-codegen/errors'
import { fields } from './config'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'

export const createChartingNote: Action<typeof fields, typeof settings> = {
  key: 'createChartingNote',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create charting note',
  description: 'Create a charting note in Healthie.',
  fields,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = payload
    const {
      healthie_patient_id,
      form_id,
      note_content,
      marked_locked,
      appointment_id,
    } = fields

    try {
      if (isNil(healthie_patient_id) || isNil(form_id) || isNil(note_content)) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'Fields are missing' },
              error: {
                category: 'MISSING_FIELDS',
                message:
                  '`healthie_patient_id`, `form_id` or `note_content` is missing',
              },
            },
          ],
        })
        return
      }

      const client = initialiseClient(settings)
      if (client !== undefined) {
        const sdk = getSdk(client)
        const { data } = await sdk.getFormTemplate({
          id: form_id,
        })

        const moduleForm = data.customModuleForm

        if (isNil(moduleForm)) {
          await onError({
            events: [
              addActivityEventLog({
                message: `Note content: ${note_content}`,
              }),
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
          return
        }

        if (!moduleForm.use_for_charting) {
          await onError({
            events: [
              {
                date: new Date().toISOString(),
                text: { en: "Form isn't a charting form" },
                error: {
                  category: 'SERVER_ERROR',
                  message: `Form with id ${form_id} cannot be used for charting`,
                },
              },
            ],
          })
          return
        }

        const firstTextAreaField = moduleForm.custom_modules?.find(
          ({ mod_type }) => mod_type === 'textarea'
        )

        if (isNil(firstTextAreaField)) {
          await onError({
            events: [
              {
                date: new Date().toISOString(),
                text: {
                  en: 'Form doesn\'t have a question of type "textarea" (long text).',
                },
                error: {
                  category: 'WRONG_DATA',
                  message: `Form with id ${form_id}  doesn't have a "textarea" field`,
                },
              },
            ],
          })
          return
        }

        await sdk.createFormAnswerGroup({
          input: {
            finished: true,
            custom_module_form_id: form_id,
            user_id: healthie_patient_id,
            appointment_id,
            form_answers: [
              {
                custom_module_id: firstTextAreaField.id,
                user_id: healthie_patient_id,
                answer: note_content,
              },
            ],
            marked_locked: marked_locked ?? false,
          },
        })

        await onComplete({
          events: [
            addActivityEventLog({
              message: `Note content: ${note_content}`,
            }),
          ],
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
