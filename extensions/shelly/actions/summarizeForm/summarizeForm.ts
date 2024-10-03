import { Category, type Action } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '../../lib'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { getResponseText } from './lib/getResponseText'
import { summarizeFormWithLLM } from './lib/summarizeFormWithLLM'
import { DISCLAIMER_MSG_FORM } from '../../lib/constants'
import { getLatestFormInCurrentStep } from '../../../../src/lib/awell'

// TODO: get rid of the console logs eventually
export const summarizeForm: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'summarizeForm',
  category: Category.WORKFLOW,
  title: 'Summarize form',
  description: 'Summarize the response of a form with AI.',
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

    const { result: responseText } = getResponseText({
      formDefinition,
      formResponse,
    })

    console.log(responseText)

    try {
      const summary = await summarizeFormWithLLM({
        ChatModelGPT4o,
        formData: responseText,
        summaryFormat, 
        language,
      })
      
      // TODO think aboutn format
      const summary_with_disclaimer = `${DISCLAIMER_MSG_FORM}\n\n${summary}`
    
      console.log(summary_with_disclaimer)

      await onComplete({
        data_points: {
          summary: summary_with_disclaimer,
        },
      })
    } catch (error) {
      console.error('Error summarizing form:', error)
      throw new Error('Error summarizing form')
    }
  },
}
