import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { validatePayloadAndCreateSdk } from '../../lib/sdk/validatePayloadAndCreateSdk'
import { processFormAnswersForSize } from '../../lib/helpers/processFormAnswers'

export const getFormAnswers: Action<typeof fields, typeof settings> = {
  key: 'getFormAnswers',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get form answers',
  description: 'Retrieve form answers from form answer group',
  fields,
  previewable: true,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log({ meta, fields: payload.fields }, 'Processing getFormAnswers')

    const {
      fields: input,
      sdk,
      settings,
    } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const { formAnswerMaxSizeKB } = settings

    try {
      const res = await sdk.getFormAnswerGroup(input)

      const rawFormAnswerGroup = res?.data?.formAnswerGroup

      if (rawFormAnswerGroup === null || rawFormAnswerGroup === undefined) {
        throw new Error(`Form answer group not found for id: ${input.id}`)
      }

      // Process form answers to replace large ones with error messages
      const processedFormAnswerGroup = processFormAnswersForSize(
        rawFormAnswerGroup,
        formAnswerMaxSizeKB,
      )

      await onComplete({
        data_points: {
          formAnswers: JSON.stringify(processedFormAnswerGroup.form_answers),
        },
      })
    } catch (error) {
      helpers.log({ meta, error }, 'error', error as Error)
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: {
              en: error instanceof Error ? error.message : 'Unknown error',
            },
            error: {
              category: 'BAD_REQUEST',
              message: error instanceof Error ? error.message : 'Unknown error',
            },
          },
        ],
      })
    }
  },
}
