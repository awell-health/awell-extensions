import { Category, type Action } from '@awell-health/extensions-core'
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
  Record<string, never>,
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
    // 1. Validate input fields
    const { summaryFormat, language } = FieldsValidationSchema.parse(
      payload.fields,
    )
    const pathway = payload.pathway

    // 2. Initialize OpenAI model with hideDataForTracing enabled
    const { model, metadata, callbacks } = await createOpenAIModel({
      settings: {}, // we use built-in API key for OpenAI
      helpers,
      payload,
      modelType: OPENAI_MODELS.GPT4o,
      hideDataForTracing: true, // Hide input and output data when tracing
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
      metadata,
      callbacks, // Add callbacks here
    })

    // Disclaimer is now handled within summarizeFormWithLLM
    const htmlSummary = await markdownToHtml(summary)

    await onComplete({
      data_points: {
        summary: htmlSummary,
      },
    })
  },
}
