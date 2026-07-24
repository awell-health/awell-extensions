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
  previewable: true,
  dataPoints,

  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log({ meta, fields: payload.fields }, 'Processing generateMessage')

    try {
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
        modelType: OPENAI_MODELS.GPT5Mini, // Using GPT-5 Mini for message generation
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
    } catch (err) {
      helpers.log({ meta, err }, 'error', err as Error)
      const error = err as Error
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: error.message },
            error: {
              category: 'SERVER_ERROR',
              message: error.message,
            },
          },
        ],
      })
    }
  },
}
