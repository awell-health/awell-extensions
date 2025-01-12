import { type Action, Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { makeAPIClient } from '../../client'
import { FieldsValidationSchema, fields, dataPoints } from './config'
import { StructuredOutputParser } from '@langchain/core/output_parsers'
import { z } from 'zod'
import { ChatOpenAI } from '@langchain/openai'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'

export const updatePatientTags: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'updatePatientTags',
  category: Category.EHR_INTEGRATIONS,
  title: 'Update patient tags',
  description: 'Update patient tags in Elation.',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const { prompt, patientId } = FieldsValidationSchema.parse(payload.fields)
    const api = makeAPIClient(payload.settings)

    const openAiApiKey = payload.settings.openAiApiKey

    if (openAiApiKey === undefined || openAiApiKey === '') {
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: 'OpenAI API key is required for this action.' },
            error: {
              category: 'SERVER_ERROR',
              message: 'OpenAI API key is required for this action.',
            },
          },
        ],
      })
      return
    }

    try {
      const { tags } = await api.getPatient(patientId)
      const existingTags = tags ?? []

      const ChatModelGPT4o = new ChatOpenAI({
        modelName: 'gpt-4o',
        openAIApiKey: openAiApiKey,
        temperature: 0,
        maxRetries: 3,
        timeout: 10000,
      })

      const systemPrompt = `You are a helpful assistant. You will receive a list of patient tags and an instruction in natural language about which tags to add, update, or remove. Your output should always be the updated list of tags (as an array). An empty array is also a valid output.

      Important Instructions:
      - The maximum number of tags is 10.
      - The max length of a single tag is 100 characters.
      - Ensure tags are unique.

Input array: ${JSON.stringify(existingTags)}
Instruction: ${prompt}

Output a JSON object with two keys:
1. updatedTags: The updated array of tags
2. explanation: A readable explanation of the changes made to the tags and why`

      const parser = StructuredOutputParser.fromZodSchema(
        z.object({
          updatedTags: z.array(z.string()),
          explanation: z.string(),
        }),
      )

      const chain = ChatModelGPT4o.pipe(parser)
      const result = await chain.invoke(systemPrompt)

      await api.updatePatient(patientId, {
        tags: result.updatedTags,
      })

      await onComplete({
        data_points: {
          updatedTags: result.updatedTags.join(', '),
        },
        events: [
          addActivityEventLog({
            message: `Previous patient tags: ${existingTags?.length > 0 ? existingTags?.join(', ') : 'No tags'}\nUpdated patient tags: ${result.updatedTags.join(', ')}\nExplanation: ${result.explanation}`,
          }),
        ],
      })
    } catch (error) {
      console.error(error)
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: 'Unable to update patient tags' },
            error: {
              category: 'SERVER_ERROR',
              message: 'Unable to update patient tags',
            },
          },
        ],
      })
    }
  },
}
