import { Category, type Action } from '@awell-health/extensions-core'
import { generateMessageWithLLM } from './lib/generateMessageWithLLM'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { markdownToHtml } from '../../../../src/utils'
import { createOpenAIModel } from '../../../../src/lib/llm/openai/createOpenAIModel'
import { OPENAI_MODELS } from '../../../../src/lib/llm/openai/constants'

/**
 * Awell Action: Message Generation
 *
 * Takes communication objective and personalization inputs, uses LLM to:
 * 1. Generate a personalized message
 * 2. Create appropriate subject line
 *
 * @returns subject and HTML-formatted message
 */
export const generateMessage: Action<
  typeof fields,
  Record<string, never>,
  keyof typeof dataPoints
> = {
  key: 'generateMessage',
  category: Category.WORKFLOW,
  title: 'Generate Message',
  description: 'Generate a personalized message',
  fields,
  previewable: false,
  dataPoints,

  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    // 1. Validate input fields
    const {
      communicationObjective,
      personalizationInput,
      stakeholder,
      language,
    } = FieldsValidationSchema.parse(payload.fields)

    // 2. Initialize OpenAI model with metadata
    const { model, metadata, callbacks } = await createOpenAIModel({
      settings: {}, // we use built-in API key for OpenAI
      helpers,
      payload,
      modelType: OPENAI_MODELS.GPT4o, // Using GPT4 for high-quality message generation
    })

    // 3. Generate message
    const { subject, message } = await generateMessageWithLLM({
      model,
      communicationObjective,
      personalizationInput,
      stakeholder,
      language,
      metadata,
      callbacks,
    })

    // 4. Format and return results
    const htmlMessage = await markdownToHtml(message)
    await onComplete({
      data_points: { subject, message: htmlMessage },
    })
  },
}
