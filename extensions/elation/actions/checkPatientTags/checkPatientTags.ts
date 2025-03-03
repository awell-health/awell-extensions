import { Category, type Action } from '@awell-health/extensions-core'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'
import { type settings } from '../../settings'
import { makeAPIClient } from '../../client'
import { FieldsValidationSchema, fields, dataPoints } from './config'
import { checkTagsWithLLM } from './lib/checkTagsWithLLM/checkTagsWithLLM'
import { createOpenAIModel } from '../../../../src/lib/llm/openai/createOpenAIModel'
import { OPENAI_MODELS } from '../../../../src/lib/llm/openai/constants'

/**
 * Awell Action: Check Patient Tags
 *
 * Takes existing tags and instructions, uses LLM to:
 * 1. Verify if tags match the given instruction
 * 2. Provide explanation for the verification result
 * 3. Return boolean result indicating if tags exist as specified
 */
export const checkPatientTags: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'checkPatientTags',
  category: Category.EHR_INTEGRATIONS,
  title: '✨ Check Patient Tags',
  description: 'Verify if patient tags in Elation match the given instruction.',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    // 1. Validate input and initialize API client
    const { instructions, patientId } = FieldsValidationSchema.parse(
      payload.fields,
    )
    const api = makeAPIClient(payload.settings)

    // 2. Get existing tags
    const { tags } = await api.getPatient(patientId)
    const existingTags = tags ?? []

    // 3. Initialize OpenAI model with metadata and callbacks
    const { model, metadata, callbacks } = await createOpenAIModel({
      settings: {}, // we use built-in API key for OpenAI
      helpers,
      payload,
      modelType: OPENAI_MODELS.GPT4o,
    })

    // 4. Check tags against instruction
    const { tagsFound, explanation } = await checkTagsWithLLM({
      model,
      existingTags,
      instructions,
      metadata,
      callbacks,
    })

    // 5. Complete action with results
    await onComplete({
      data_points: {
        tagsFound: tagsFound ? 'true' : 'false',
        explanation,
      },
      events: [
        addActivityEventLog({
          message: `Patient tags: ${existingTags?.length > 0 ? existingTags?.join(', ') : 'No tags'}\nInstruction: ${instructions}\nResult: ${tagsFound ? 'true' : 'false'}\nExplanation: ${explanation}`,
        }),
      ],
    })
  },
} 