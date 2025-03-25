import { Category, type Action } from '@awell-health/extensions-core'
import { summarizeFormWithLLM } from '../../lib/summarizeFormWithLLM'
import { createOpenAIModel } from '../../../../src/lib/llm/openai/createOpenAIModel'
import { OPENAI_MODELS } from '../../../../src/lib/llm/openai/constants'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { getFormResponseText } from '../../lib/getFormResponseText'
import { getLatestFormInCurrentStep } from '../../../../src/lib/awell'
import { markdownToHtml } from '../../../../src/utils'
import { getCareFlowDetails } from '../../lib/getCareFlowDetails'
import { isNil } from 'lodash'

/**
 * Awell Action: Form Summarization
 *
 * Takes form responses and preferences as input, uses LLM to:
 * 1. Generate a concise summary in specified format and language
 * 2. Includes appropriate disclaimer
 *
 * @returns HTML-formatted summary
 */
export const summarizeForm: Action<
  typeof fields,
  Record<string, never>,
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
    // 1. Validate input fields
    const { summaryFormat, language, additionalInstructions } = FieldsValidationSchema.parse(
      payload.fields,
    )

    // 2. Initialize OpenAI model with metadata
    const { model, metadata, callbacks } = await createOpenAIModel({
      settings: {}, // we use built-in API key for OpenAI
      helpers,
      payload,
      modelType: OPENAI_MODELS.GPT4o,
      hideDataForTracing: true, // Hide input and output data when tracing
    })

    const awellSdk = await helpers.awellSdk()

    // Get care flow details for the disclaimer
    const careFlowDetails = await getCareFlowDetails(awellSdk, payload.pathway.id)
    
    // 3. Get form data
    const { formDefinition, formResponse } = await getLatestFormInCurrentStep({
      awellSdk,
      pathwayId: payload.pathway.id,
      activityId: payload.activity.id,
    })

    const { result: formData } = getFormResponseText({
      formDefinition,
      formResponse,
    })

    // Create disclaimer message based on version availability
    let disclaimerMessage = '';
    if (!isNil(careFlowDetails.version)) {
      disclaimerMessage = `**Important Notice:** The content provided is an AI-generated summary of form responses of version ${careFlowDetails.version} of Care Flow "${careFlowDetails.title}" (ID: ${payload.pathway.id}).`;
    } else {
      disclaimerMessage = `**Important Notice:** The content provided is an AI-generated summary of form responses of Care Flow "${careFlowDetails.title}" (ID: ${payload.pathway.id}).`;
    }

    // 4. Generate summary
    const summary = await summarizeFormWithLLM({
      model,
      formData,
      summaryFormat,
      language,
      disclaimerMessage,
      additionalInstructions,
      metadata,
      callbacks,
    })

    // 5. Format and return results
    const htmlSummary = await markdownToHtml(summary)
    await onComplete({
      data_points: {
        summary: htmlSummary,
      },
    })
  },
}
