import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { isNil } from 'lodash'
import { validatePayloadAndCreateSdk } from '../../lib/validatePayloadAndCreateSdk'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'

export const getCallDetails: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getCallDetails',
  category: Category.COMMUNICATION,
  title: 'Get call details',
  description:
    'Retrieve detailed information, metadata and transcripts for a call.',
  fields,
  previewable: true,
  dataPoints,
  supports_automated_retries: true,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log({ meta, fields: payload.fields }, 'Processing getCallDetails')

    try {
      const { fields, blandSdk } = await validatePayloadAndCreateSdk({
        fieldsSchema: FieldsValidationSchema,
        payload,
      })

      const { data } = await blandSdk.getCallDetails({
        call_id: fields.callId,
      })

      await onComplete({
        data_points: {
          callData: isNil(data) ? undefined : JSON.stringify(data),
          callLength: isNil(data.call_length)
            ? undefined
            : data.call_length.toString(),
          to: data.to,
          from: data.from,
          completed: String(data.completed),
          metadata: isNil(data.metadata)
            ? undefined
            : JSON.stringify(data.metadata),
          summary: data.summary,
          startedAt: data.started_at,
          endAt: data.end_at,
          analysisSchema: isNil(data.analysis_schema)
            ? undefined
            : JSON.stringify(data.analysis_schema),
          analysis: isNil(data.analysis)
            ? undefined
            : JSON.stringify(data.analysis),
          concatenatedTranscript: data.concatenated_transcript,
          transcripts: isNil(data.transcripts)
            ? undefined
            : JSON.stringify(data.transcripts),
          status: data.status,
          answeredBy: data.answered_by ?? '',
          errorMessage: data.error_message ?? '',
        },
      })
    } catch (err) {
      helpers.log({ meta, err }, 'error', err as Error)
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
