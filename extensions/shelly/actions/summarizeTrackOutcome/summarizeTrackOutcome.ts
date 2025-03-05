import { Category, type Action } from '@awell-health/extensions-core'
import { type Activity } from '@awell-health/awell-sdk'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { markdownToHtml } from '../../../../src/utils'
import { summarizeTrackOutcomeWithLLM } from './lib/summarizeTrackOutcomeWithLLM'
import { createOpenAIModel } from '../../../../src/lib/llm/openai'
import { OPENAI_MODELS } from '../../../../src/lib/llm/openai/constants'
import { getTrackData } from '../../lib/getTrackData/index'

export const summarizeTrackOutcome: Action<
  typeof fields,
  Record<string, never>,
  keyof typeof dataPoints
> = {
  key: 'summarizeTrackOutcome',
  category: Category.WORKFLOW,
  title: 'Summarize Track Outcome (Beta)',
  description: 'Summarize the care flow track outcome and decision path',
  fields,
  previewable: false,
  dataPoints,

  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    // 1. Validate input fields
    const { instructions } = FieldsValidationSchema.parse(payload.fields)
    const pathway = payload.pathway

    // 2. Initialize OpenAI model with metadata
    const { model, metadata, callbacks } = await createOpenAIModel({
      settings: {}, // we use built-in API key for OpenAI
      helpers,
      payload,
      modelType: OPENAI_MODELS.GPT4o,
      hideDataForTracing: false, // TODO: set to true before production
    })

    const awellSdk = await helpers.awellSdk()

    // Get pathway details for the disclaimer
    const pathwayDetails = await awellSdk.orchestration.query({
      pathway: {
        __args: {
          id: pathway.id,
        },
        code: true,
        success: true,
        pathway: {
          id: true,
          title: true,
          pathway_definition_id: true,
        },
      },
    })

    // 3. Get track data including forms and decision path
    const trackData = await getTrackData({
      awellSdk,
      pathwayId: pathway.id,
      trackId: (payload.activity as Activity).context?.track_id ?? '',
      currentActivityId: (payload.activity as Activity).id,
    })

    const summary = await summarizeTrackOutcomeWithLLM({
      model,
      trackActivities: JSON.stringify(trackData, null, 2),
      instructions,
      metadata,
      callbacks,
    })

    const disclaimerMsg = `Important Notice: The content provided is an AI-generated summary of Care Flow "${pathwayDetails.pathway?.pathway?.title ?? 'Unknown'}" (ID: ${pathwayDetails.pathway?.pathway?.pathway_definition_id ?? 'Unknown'}).`

    const htmlSummary = await markdownToHtml(`${disclaimerMsg}\n\n${summary}`)

    await onComplete({
      data_points: {
        outcomeSummary: htmlSummary,
      },
    })
  },
} 