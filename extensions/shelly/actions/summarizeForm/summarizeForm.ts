import { Category, type Action } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '../../lib'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { getFormResponseText } from '../../lib/getFormResponseText'
import { summarizeFormWithLLM } from '../../lib/summarizeFormWithLLM'
import { DISCLAIMER_MSG_FORM } from '../../lib/constants'
import { getLatestFormInCurrentStep } from '../../../../src/lib/awell'
import { markdownToHtml } from '../../../../src/utils'

// TODO: get rid of the console logs eventually
export const summarizeForm: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'summarizeForm',
  category: Category.WORKFLOW,
  title: 'Summarize Form',
  description: 'Summarize the response of a last form in a step with AI.',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const {
      ChatModelGPT4o,
      fields: { summaryFormat, language },
      pathway,
      activity,
    } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const { formDefinition, formResponse } = await getLatestFormInCurrentStep({
      awellSdk: await helpers.awellSdk(),
      pathwayId: pathway.id,
      activityId: activity.id,
    })

    const { result: responseText } = getFormResponseText({
      formDefinition,
      formResponse,
    })

    try {
      const summary = await summarizeFormWithLLM({
        ChatModelGPT4o,
        formData: responseText,
        summaryFormat, 
        language,
        disclaimerMessage: DISCLAIMER_MSG_FORM,
      })

      const htmlSummary = await markdownToHtml(summary)
    

      await onComplete({
        data_points: {
          summary: htmlSummary,
        },
      })
    } catch (error) {
      console.error('Error summarizing form:', error)
      throw new Error('Error summarizing form')
    }
  },
}
