import { isNil } from 'lodash'
import { StructuredOutputParser } from '@langchain/core/output_parsers'
import { ChatOpenAI } from '@langchain/openai'
import { type Action, Category } from '@awell-health/extensions-core'

import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'
import { type settings } from '../../settings'
import { makeAPIClient } from '../../client'
import { FieldsValidationSchema, fields, dataPoints } from './config'
import { createTagsUpdatePrompt } from './createPrompt'
import { updateElationTags } from './updateTags'
import { type TagsOutput, TagsOutputSchema, TagsSchema } from './config/tagsSchema'


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
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const { prompt, patientId } = FieldsValidationSchema.parse(payload.fields)
    const api = makeAPIClient(payload.settings)

    const openAiConfig = helpers.getOpenAIConfig()

    const customOpenAiApiKey = !isNil(payload.settings.openAiApiKey)

    // log which api key is being used
    console.info(`Using ${customOpenAiApiKey ? "client custom" : "Awell"} Open AI API key for updatePatientTags action ${patientId}`
    )

    // get existing tags
    const { tags } = await api.getPatient(patientId)
    const existingTags = tags ?? []

    const ChatModelGPT4o = new ChatOpenAI({
      modelName: 'gpt-4o-2024-08-06',
      openAIApiKey: customOpenAiApiKey ? payload.settings.openAiApiKey : openAiConfig.apiKey,
      temperature: openAiConfig.temperature,
      maxRetries: openAiConfig.maxRetries,
      timeout: openAiConfig.timeout,
    })

    const systemPrompt = createTagsUpdatePrompt(existingTags, prompt)

    const parser = StructuredOutputParser.fromZodSchema(TagsOutputSchema)
    let result: TagsOutput

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

    await updateElationTags(api, patientId, validatedTags)

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
