import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { getResponsesForAllForms } from '../../lib/getFormResponseText'
import { summarizeFormWithLLM } from '../../lib/summarizeFormWithLLM'
import { DISCLAIMER_MSG_FORM } from '../../lib/constants'
import { getAllFormsInCurrentStep } from '../../../../src/lib/awell'
import { markdownToHtml } from '../../../../src/utils'
import { createOpenAIModel } from '../../../../src/lib/llm/openai'
import { OPENAI_MODELS } from '../../../../src/lib/llm/openai/constants'


export const summarizeFormsInStep: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'summarizeFormsInStep',
  category: Category.WORKFLOW,
  title: 'Summarize Forms in Step',
  description: 'Summarize the responses of all forms in the step with AI.',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    try {
      // 1. Validate input fields
      const { summaryFormat, language } = FieldsValidationSchema.parse(payload.fields)
      const pathway = payload.pathway

      // 2. Initialize OpenAI model with metadata
      const { model, metadata } = await createOpenAIModel({
        settings: payload.settings,
        helpers,
        payload,
        modelType: OPENAI_MODELS.GPT4o
      })
      
      // Fetch all forms in the current step
      const formsData = await getAllFormsInCurrentStep({
        awellSdk: await helpers.awellSdk(),
        pathwayId: pathway.id,
        activityId: payload.activity.id,
      })

      // Get responses for all forms
      const { result: allFormsResponseText } = getResponsesForAllForms({
        formsData,
      })

      // Summarize all forms' responses
      const summary = await summarizeFormWithLLM({
        model,
        formData: allFormsResponseText,
        summaryFormat, 
        language,
        disclaimerMessage: DISCLAIMER_MSG_FORM,
        metadata
      })
      
      // Disclaimer is now handled within summarizeFormWithLLM
      const htmlSummary = await markdownToHtml(summary)
    
      await onComplete({
        data_points: {
          summary: htmlSummary,
        },
      })
    } catch (error) {
      throw new Error('Error summarizing forms')
    }
  },
}
