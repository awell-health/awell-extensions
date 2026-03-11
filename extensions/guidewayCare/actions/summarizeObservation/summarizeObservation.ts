import axios from 'axios'
import { type AxiosError } from 'axios'
import { type Action, Category } from '@awell-health/extensions-core'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'
import { DEFAULT_BASE_URL, type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import type {
  GwcSummarizationRequest,
  GwcSummarizationSuccessResponse,
  GwcSummarizationErrorResponse,
} from './types'

export const summarizeObservation: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'summarizeObservation',
  category: Category.AI,
  title: 'Summarize Observation',
  description:
    'Submit a patient call transcript or interaction text and receive AI-generated observations, summary, and follow-up list.',
  fields,
  dataPoints,
  previewable: false,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const validatedFields = FieldsValidationSchema.parse(payload.fields)
    const baseUrl = payload.settings.baseUrl ?? DEFAULT_BASE_URL

    try {
      const requestBody: GwcSummarizationRequest = {
        source_text: validatedFields.sourceText,
        care_flow_id: validatedFields.careFlowId,
        processed_datetime: validatedFields.processedDatetime,
        source_type: validatedFields.sourceType,
        source_id: validatedFields.sourceId,
        context:
          validatedFields.context != null
            ? (JSON.parse(validatedFields.context) as Record<string, string>)
            : undefined,
      }

      const response = await axios.post<GwcSummarizationSuccessResponse>(
        `${baseUrl}/gwc_observation_summarization`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': payload.settings.apiKey,
          },
        },
      )

      const data = response.data.data
      const { analysis, tokenUsage } = data

      await onComplete({
        data_points: {
          summary: analysis.summary,
          observationsSummaryFormatted: analysis.observations_summary_formatted,
          followupFormatted: analysis.followup_formatted,
          observations: JSON.stringify(analysis.observations),
          sourceId: data.source_id,
          processedAt: data.processedAt,
          processingTimeMs: String(data.processingTimeMs),
          promptVersion: String(data.prompt_version),
          totalTokens: String(tokenUsage.totalTokens),
          estimatedCost: String(tokenUsage.estimatedCost),
        },
      })
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const err = error as AxiosError<GwcSummarizationErrorResponse>

        if (err.response?.status === 400) {
          await onError({
            events: [
              addActivityEventLog({
                message:
                  err.response.data?.message ??
                  `Bad request (400): ${JSON.stringify(err.response.data)}`,
              }),
            ],
          })
          return
        }

        if (err.response?.status === 401) {
          await onError({
            events: [
              addActivityEventLog({
                message: 'Invalid or missing API key (401)',
              }),
            ],
          })
          return
        }

        if (err.response?.status === 500) {
          await onError({
            events: [
              addActivityEventLog({
                message:
                  err.response.data?.message ?? 'Internal server error (500)',
              }),
            ],
          })
          return
        }
      }

      throw error
    }
  },
}
