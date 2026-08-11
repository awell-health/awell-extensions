import { Category, type Action } from '@awell-health/extensions-core'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { DISCLAIMER_MSG } from '../../lib/constants'
import { SettingsValidationSchema, type settings } from '../../settings'
import {
  formatSummaryWithDisclaimer,
  resolveDisclaimerConfig,
} from '../../lib/disclaimer'
import { summarizeCareFlowWithLLM } from './lib/summarizeCareFlowWithLLM'
import { markdownToHtml } from '../../../../src/utils'
import { createOpenAIModel } from '../../../../src/lib/llm/openai'
import { OPENAI_MODELS } from '../../../../src/lib/llm/openai/constants'

export const summarizeCareFlow: Action<
  typeof fields,
  typeof settings,
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
    helpers.log({ fields: payload.fields }, 'Processing summarizeCareFlow')

    try {
      // 1. Validate input fields
      const {
        additionalInstructions,
        stakeholder,
        disclaimerText,
        disclaimerPlacement,
      } = FieldsValidationSchema.parse(payload.fields)
      const {
        disclaimerText: tenantDisclaimerText,
        disclaimerPlacement: tenantDisclaimerPlacement,
      } = SettingsValidationSchema.parse(payload.settings ?? {})
      const pathway = payload.pathway

      // 2. Initialize OpenAI model with metadata
      const { model, metadata, callbacks } = await createOpenAIModel({
        settings: {}, // we use built-in API key for OpenAI
        helpers,
        payload,
        modelType: OPENAI_MODELS.GPT5Mini,
      })

      const awellSdk = await helpers.awellSdk()

      /**
       * Limitation: this query is paginated so we might not get all care flow activities - which is ok for now
       */
      const careflowActivitiesUntilNow = await awellSdk.orchestration.query({
        careflowActivities: {
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
          careflowActivitiesUntilNow.careflowActivities.activities,
          null,
          2,
        ),
        stakeholder,
        additionalInstructions,
        metadata,
        callbacks,
      })

      const { disclaimer, placement } = resolveDisclaimerConfig({
        actionDisclaimerText: disclaimerText,
        actionDisclaimerPlacement: disclaimerPlacement,
        tenantDisclaimerText,
        tenantDisclaimerPlacement,
        defaultDisclaimer: DISCLAIMER_MSG,
      })

      const htmlSummary = await markdownToHtml(
        formatSummaryWithDisclaimer({
          summary,
          disclaimer,
          placement,
        }),
      )

      await onComplete({
        data_points: {
          summary: htmlSummary,
        },
      })
    } catch (err) {
      helpers.log({ err }, 'error', err as Error)
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
