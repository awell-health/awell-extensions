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
  onEvent: async ({ payload, onComplete }): Promise<void> => {
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
      },
    })
  },
}
