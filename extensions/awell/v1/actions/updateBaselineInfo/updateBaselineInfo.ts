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
  onEvent: async ({ payload, onComplete, helpers }): Promise<void> => {
    const {
      fields: { baselineInfo },
      pathway: { id: pathwayId },
    } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
        pathway: PathwayValidationSchema,
      }),
      payload,
    })

    const sdk = await helpers.awellSdk()

    await sdk.orchestration.mutation({
      updateBaselineInfo: {
        __args: {
          input: {
            pathway_id: pathwayId,
            baseline_info: baselineInfo,
          },
        },
        code: true,
        success: true
      },
    })

    await onComplete()
  },
}
