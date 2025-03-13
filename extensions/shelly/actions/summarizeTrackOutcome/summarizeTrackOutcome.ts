import { Category, type Action } from '@awell-health/extensions-core'
import { type Activity } from '@awell-health/awell-sdk'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { markdownToHtml } from '../../../../src/utils'
import { summarizeTrackOutcomeWithLLM } from './lib/summarizeTrackOutcomeWithLLM'
import { createOpenAIModel } from '../../../../src/lib/llm/openai'
import { OPENAI_MODELS } from '../../../../src/lib/llm/openai/constants'
import { getTrackData } from '../../lib/getTrackData/index'
import { getCareFlowDetails } from '../../lib/getCareFlowDetails'
import { isNil } from 'lodash'

export const summarizeTrackOutcome: Action<
  typeof fields,
  Record<string, never>,
  keyof typeof dataPoints
> = {
  key: 'summarizeTrackOutcome',
  category: Category.WORKFLOW,
  title: 'Summarize Track Outcome (Beta)',
  description: 'Summarize the care flow track outcome and activities that led to the outcome',
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

    // Get activity details to find track_id
    const activityId = payload.activity.id
    const activityDetails = await awellSdk.orchestration
      .query({
        activity: {
          __args: {
            id: activityId,
          },
          success: true,
          activity: {
            id: true,
            context: {
              track_id: true,
            },
          },
        },
      })

    const currentActivity = activityDetails?.activity?.activity

    if (isNil(currentActivity) || !activityDetails.activity.success) {
      throw new Error(`Failed to fetch activity ${activityId}`)
    }

    const trackId = currentActivity.context?.track_id

    if (isNil(trackId) || trackId.trim() === '') {
      throw new Error('Could not find track ID for the current activity')
    }

    // 3. Get track data including forms and decision path
    const trackData = await getTrackData({
      awellSdk,
      pathwayId: pathway.id,
      trackId,
      currentActivityId: (payload.activity as Activity).id,
    })

    // 4. Generate summary with LLM
    const summary = await summarizeTrackOutcomeWithLLM({
      model,
      trackActivities: JSON.stringify(trackData, null, 2),
      instructions,
      metadata,
      callbacks,
    })

    // Get care flow details for the disclaimer
    const careFlowDetails = await getCareFlowDetails(awellSdk, pathway.id)
    
    // Create version string if version is available
    const versionStr = careFlowDetails.version !== null 
      ? ` version ${careFlowDetails.version}` 
      : '';
    
    const disclaimerMsg = `Important Notice: The content provided is an AI-generated summary of${versionStr} Care Flow "${careFlowDetails.title}" (ID: ${careFlowDetails.id}).`

    const htmlSummary = await markdownToHtml(`${disclaimerMsg}\n\n${summary}`)

    await onComplete({
      data_points: {
        outcomeSummary: htmlSummary,
      },
    })
  },
} 