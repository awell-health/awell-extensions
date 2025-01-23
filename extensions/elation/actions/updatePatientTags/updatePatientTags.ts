import { Category, type Action } from '@awell-health/extensions-core'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'
import { type settings } from '../../settings'
import { makeAPIClient } from '../../client'
import { FieldsValidationSchema, fields, dataPoints } from './config'
import { updateElationTags } from './updateTags'
import { getTagsFromLLM } from './lib/getTagsFromLLM/getTagsFromLLM'
import { createOpenAIModel } from '../../../../src/lib/llm/openai/createOpenAIModel'
import { OPENAI_MODELS } from '../../../../src/lib/llm/openai/constants'

/**
 * Awell Action: Update Patient Tags
 * 
 * Takes existing tags and instructions, uses LLM to:
 * 1. Generate updated list of tags
 * 2. Provide explanation for changes
 * 3. Update tags in Elation
 */
export const updatePatientTags: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'updatePatientTags',
  category: Category.EHR_INTEGRATIONS,
  title: '🪄 Update patient tags (Beta)',
  description: 'Update patient tags in Elation.',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    try {
      // 1. Validate input and initialize API client
      const { prompt, patientId } = FieldsValidationSchema.parse(payload.fields)
      const api = makeAPIClient(payload.settings)

      // 2. Get existing tags
      const { tags } = await api.getPatient(patientId)
      const existingTags = tags ?? []

      // 3. Initialize OpenAI model with metadata
      const { model, metadata } = await createOpenAIModel({
        settings: payload.settings,
        helpers,
        payload,
        modelType: OPENAI_MODELS.GPT4o
      })

      // 4. Generate updated tags
      const { validatedTags, explanation } = await getTagsFromLLM({
        model,
        existingTags,
        prompt,
        metadata
      })

      // 5. Update tags in Elation
      await updateElationTags(api, patientId, validatedTags)

      // 6. Complete action with results
      await onComplete({
        data_points: {
          updatedTags: validatedTags.join(', '),
        },
        events: [
          addActivityEventLog({
            message: `Previous patient tags: ${existingTags?.length > 0 ? existingTags?.join(', ') : 'No tags'}\nUpdated patient tags: ${validatedTags.join(', ')}\nExplanation: ${explanation}`,
          }),
        ],
      })
    } catch (error) {
      if (error instanceof Error) {
        await onError({
          events: [{
            date: new Date().toISOString(),
            text: { en: error.message },
            error: {
              category: 'SERVER_ERROR',
              message: error.message
            }
          }]
        })
        return
      }
      throw error
    }
  },
}
