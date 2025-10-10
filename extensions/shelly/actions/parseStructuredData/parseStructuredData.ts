import { Category, type Action } from '@awell-health/extensions-core'
import { parseStructuredDataWithLLM } from './lib/parseStructuredDataWithLLM'
import { createOpenAIModel } from '../../../../src/lib/llm/openai/createOpenAIModel'
import { OPENAI_MODELS } from '../../../../src/lib/llm/openai/constants'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { markdownToHtml } from '../../../../src/utils'
import { isNil } from 'lodash'

/**
 * Awell Action: Parse Structured Data
 *
 * Takes a message and a JSON schema as input, uses LLM to:
 * 1. Extract structured data matching the schema
 * 2. Provide a confidence level (0-100) for the extraction
 * 3. Provide explanation for the extraction process
 *
 * @returns parsed data (JSON), confidence level (number), and HTML-formatted explanation
 */
export const parseStructuredData: Action<
  typeof fields,
  Record<string, never>,
  keyof typeof dataPoints
> = {
  key: 'parseStructuredData',
  category: Category.WORKFLOW,
  title: 'Parse Structured Data (Beta)',
  description:
    'Extracts structured data from unstructured text messages using a provided JSON schema.',
  fields,
  previewable: false,
  dataPoints,

  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    // 1. Validate input fields
    const {
      message: messageText,
      messageDataPoint,
      schema,
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
      return
    }

    // 2. Initialize OpenAI model with metadata
    const { model, metadata, callbacks } = await createOpenAIModel({
      settings: {}, // we use built-in API key for OpenAI
      helpers,
      payload,
      modelType: OPENAI_MODELS.GPT5Mini,
    })

    // 3. Perform structured data extraction
    const result = await parseStructuredDataWithLLM({
      model,
      message,
      schema,
      instructions,
      metadata,
      callbacks,
    })

    // 4. Format and return results
    const explanationHtml = await markdownToHtml(result.explanation)
    await onComplete({
      data_points: {
        parsedData: JSON.stringify(result.data),
        confidenceLevel: String(result.confidenceLevel),
        explanation: explanationHtml,
      },
    })
  },
}
