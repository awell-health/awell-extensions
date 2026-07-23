import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import {
  fields,
  FieldsValidationSchema,
  PathwayValidationSchema,
  dataPoints,
} from './config'
import z from 'zod'

export const updateBaselineInfo: Action<typeof fields, typeof settings> = {
  key: 'updateBaselineInfo',
  category: Category.WORKFLOW,
  title: 'Update Baseline Datapoints',
  description:
    'Update some (or all) of the baseline datapoints for the patient currently enrolled in the care flow.',
  fields,
  dataPoints,
  previewable: false,
  supports_automated_retries: true,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log(
      { meta, fields: payload.fields },
      'Processing updateBaselineInfo',
    )

    try {
      const {
        fields: { careflowId: externalCareflowId, baselineInfo },
        pathway: { id: currentCareflowId },
      } = validate({
        schema: z.object({
          fields: FieldsValidationSchema,
          pathway: PathwayValidationSchema,
        }),
        payload,
      })

      const sdk = await helpers.awellSdk()

      const { updateBaselineInfo } = await sdk.orchestration.mutation({
        updateBaselineInfo: {
          __args: {
            input: {
              pathway_id: externalCareflowId ?? currentCareflowId,
              baseline_info: baselineInfo,
            },
          },
          code: true,
          success: true,
        },
      })

      await onComplete({
        data_points: {
          success: updateBaselineInfo.success.toString(),
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
