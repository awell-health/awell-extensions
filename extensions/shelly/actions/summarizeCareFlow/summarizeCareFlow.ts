import { Category, type Action } from '@awell-health/extensions-core'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { DISCLAIMER_MSG } from '../../lib/constants'
import { summarizeCareFlowWithLLM } from './lib/summarizeCareFlowWithLLM'
import { markdownToHtml } from '../../../../src/utils'
import { createOpenAIModel } from '../../../../src/lib/llm/openai'
import { OPENAI_MODELS } from '../../../../src/lib/llm/openai/constants'

export const summarizeCareFlow: Action<
  typeof fields,
  Record<string, never>,
  keyof typeof dataPoints
> = {
  key: 'summarizeCareFlow',
  category: Category.WORKFLOW,
  title: 'Summarize Care Flow',
  description: 'Summarize the care flow up until now',
  fields,
  previewable: false,
  dataPoints,

  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    // 1. Validate input fields
    const { additionalInstructions, stakeholder } =
      FieldsValidationSchema.parse(payload.fields)
    const pathway = payload.pathway

    // 2. Initialize OpenAI model with metadata
    const { model, metadata, callbacks } = await createOpenAIModel({
      settings: {}, // we use built-in API key for OpenAI
      helpers,
      payload,
      modelType: OPENAI_MODELS.GPT4o,
    })

    const awellSdk = await helpers.awellSdk()

    /**
     * Limitation: this query is paginated so we might not get all pathway activities - which is ok for now
     */
    const pathwayActivitesUntilNow = await awellSdk.orchestration.query({
      pathwayActivities: {
        __args: {
          pathway_id: pathway.id,
          pagination: { offset: 0, count: 500 },
          sorting: {
            direction: 'desc',
            field: 'date',
          },
        },
        activities: {
          __scalar: true,
          subject: {
            __scalar: true,
          },
          object: {
            __scalar: true,
          },
          indirect_object: {
            __scalar: true,
          },
          context: {
            __scalar: true,
          },
          track: {
            __scalar: true,
          },
          sub_activities: {
            __scalar: true,
          },
        },
      },
    })

    const summary = await summarizeCareFlowWithLLM({
      model,
      careFlowActivities: JSON.stringify(
        pathwayActivitesUntilNow.pathwayActivities.activities,
        null,
        2,
      ),
      stakeholder,
      additionalInstructions,
      metadata,
      callbacks,
    })

    const htmlSummary = await markdownToHtml(`${DISCLAIMER_MSG}\n\n${summary}`)

    await onComplete({
      data_points: {
        summary: htmlSummary,
      },
    })
  },
}
