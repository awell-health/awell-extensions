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
  title: '🪄 Update patient tags',
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

    const { tags } = await api.getPatient(patientId)
    const existingTags = tags ?? []

    const ChatModelGPT4o = new ChatOpenAI({
      modelName: 'gpt-4o-2024-08-06',
      openAIApiKey: openAiApiKey,
      temperature: 0,
      maxRetries: 3,
      timeout: 10000,
    })

    const systemPrompt = `You are a clinical data manager. You will receive a list (array) of patient tags for a single patient and instructions about which tags to add, update, or remove. These tags are used to assign particular attributes to patients which can help with patient care, like grouping of patients, categorizing patients for reporting, or identifying patients for care.
      
      Important instructions:
      - The maximum number of tags is 10.
      - The max length of a single tag is 100 characters.
      - Ensure tags are unique.

Input array: ${JSON.stringify(existingTags)}
Instruction: ${prompt}

Output a JSON object with two keys:
1. updatedTags: The updated array of tags. If the input array is empty, the output should be an empty array.
2. explanation: A readable explanation of the changes made to the tags and why`

    const SingleTagSchema = z.string().max(100).describe('A single tag')
    const TagsSchema = z
      .array(SingleTagSchema)
      .max(10)
      .refine((items) => new Set(items).size === items.length, {
        message: 'All items must be unique, no duplicate values allowed',
      })
      .describe('The updated array of tags')

    const parser = StructuredOutputParser.fromZodSchema(
      z.object({
        updatedTags: TagsSchema,
        explanation: z
          .string()
          .describe(
            'A readable explanation of the changes made to the tags and why',
          ),
      }),
    )

    let result: z.infer<typeof parser.schema>

    try {
      const chain = ChatModelGPT4o.pipe(parser)
      result = await chain.invoke(systemPrompt)
    } catch (invokeError) {
      console.error(
        'Error invoking ChatModelGPT4o for updatePatientTags:',
        invokeError,
      )
      throw new Error('Failed to update patient tags.')
    }

    const validatedTags = TagsSchema.parse(result.updatedTags)

    await api.updatePatient(patientId, {
      tags: validatedTags,
    })

    await onComplete({
      data_points: {
        updatedTags: validatedTags.join(', '),
      },
      events: [
        addActivityEventLog({
          message: `Previous patient tags: ${existingTags?.length > 0 ? existingTags?.join(', ') : 'No tags'}\nUpdated patient tags: ${validatedTags.join(', ')}\nExplanation: ${result.explanation}`,
        }),
      ],
    })
  },
}
