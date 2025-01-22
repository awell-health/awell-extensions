import { isNil } from 'lodash'
import { type Action, Category } from '@awell-health/extensions-core'

import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'
import { type settings } from '../../settings'
import { makeAPIClient } from '../../client'
import { FieldsValidationSchema, fields, dataPoints } from './config'
import { updateElationTags } from './updateTags'
import { getTagsFromAI } from './getTagsFromAI'

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

    const apiKey = !isNil(payload.settings.openAiApiKey)
      ? payload.settings.openAiApiKey
      : openAiConfig.apiKey

    // log which api key is being used
    console.info(
      `Using ${!isNil(payload.settings.openAiApiKey) ? 'client custom' : 'Awell'} Open AI API key for updatePatientTags action ${patientId}`,
    )

    // get existing tags
    const { tags } = await api.getPatient(patientId)
    const existingTags = tags ?? []

    const { validatedTags, explanation } = await getTagsFromAI({
      apiKey,
      openAiConfig,
      existingTags,
      prompt,
    })

    await updateElationTags(api, patientId, validatedTags)

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
  },
}
