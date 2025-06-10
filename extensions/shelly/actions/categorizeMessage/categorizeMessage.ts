import { Category, type Action } from '@awell-health/extensions-core'
import { categorizeMessageWithLLM } from './lib/categorizeMessageWithLLM'
import { createOpenAIModel } from '../../../../src/lib/llm/openai/createOpenAIModel'
import { OPENAI_MODELS } from '../../../../src/lib/llm/openai/constants'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { markdownToHtml } from '../../../../src/utils'
import { isNil } from 'lodash'

/**
 * Awell Action: Message Categorization
 *
 * Takes a message and predefined categories as input, uses LLM to:
 * 1. Determine the most appropriate category
 * 2. Provide explanation for the categorization
 *
 * @returns category and HTML-formatted explanation
 */
export const categorizeMessage: Action<
  typeof fields,
  Record<string, never>,
  keyof typeof dataPoints
> = {
  key: 'categorizeMessage',
  category: Category.WORKFLOW,
  title: 'Categorize Message (Beta)',
  description:
    'Categorizes messages into predefined categories with explanation.',
  fields,
  previewable: false,
  dataPoints,

  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    // 1. Validate input fields
    const {
      message: messageText,
      messageDataPoint,
      categories,
      instructions,
    } = FieldsValidationSchema.parse(payload.fields)

    const message: string =
      !isNil(messageDataPoint) && messageDataPoint?.length > 0
        ? messageDataPoint
        : (messageText ?? '')

    // ensure message is not empty
    if (message.length === 0) {
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: 'Either message or messageDataPoint is required' },
            error: {
              category: 'BAD_REQUEST',
              message: 'Either message or messageDataPoint is required',
            },
          },
        ],
      })
    }

    // 2. Initialize OpenAI model with metadata
    const { model, metadata, callbacks } = await createOpenAIModel({
      settings: {}, // we use built-in API key for OpenAI
      helpers,
      payload,
      modelType: OPENAI_MODELS.GPT4oMini,
    })

    // 3. Perform categorization
    const result = await categorizeMessageWithLLM({
      model,
      message,
      categories,
      instructions,
      metadata,
      callbacks,
    })

    // 4. Format and return results
    const explanationHtml = await markdownToHtml(result.explanation)
    await onComplete({
      data_points: { category: result.category, explanation: explanationHtml },
    })
  },
}
