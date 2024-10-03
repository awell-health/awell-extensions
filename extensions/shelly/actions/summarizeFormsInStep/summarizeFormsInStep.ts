import { Category, type Action } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '../../lib'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { getResponsesForAllForms } from '../../lib/getFormResponseText'
import { summarizeFormWithLLM } from '../../lib/summarizeFormWithLLM'
import { DISCLAIMER_MSG_FORM } from '../../lib/constants'
import { getAllFormsInCurrentStep } from '../../../../src/lib/awell'

// TODO: get rid of the console logs eventually
export const summarizeFormsInStep: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'summarizeForm',
  category: Category.WORKFLOW,
  title: 'Summarize all forms in the step',
  description: 'Summarize the responses of all forms in the step with AI.',
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
    
   
    // Fetch all forms in the current step
    const formsData = await getAllFormsInCurrentStep({
      awellSdk: await helpers.awellSdk(),
      pathwayId: pathway.id,
      activityId: activity.id,
    })


    // Get responses for all forms
    const { result: allFormsResponseText } = getResponsesForAllForms({
      formsData,
    })

    try {
      // Summarize all forms' responses
      const summary = await summarizeFormWithLLM({
        ChatModelGPT4o,
        formData: allFormsResponseText, // Use the concatenated form responses
        summaryFormat, 
        language,
      })
      
      // Add disclaimer to the summary
      const summary_with_disclaimer = `${DISCLAIMER_MSG_FORM}\n\n${summary}`
    
      console.log(summary_with_disclaimer)

      await onComplete({
        data_points: {
          summary: summary_with_disclaimer,
        },
      })
    } catch (error) {
      console.error('Error summarizing forms:', error)
      throw new Error('Error summarizing forms')
    }
  },
}
