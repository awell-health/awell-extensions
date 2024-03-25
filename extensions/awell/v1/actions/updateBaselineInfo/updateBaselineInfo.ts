import { type Action } from '@awell-health/extensions-core'
import { SettingsValidationSchema, type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import {
  fields,
  FieldsValidationSchema,
  PathwayValidationSchema,
  dataPoints,
} from './config'
import z from 'zod'
import AwellSdk from '../../sdk/awellSdk'

export const updateBaselineInfo: Action<typeof fields, typeof settings> = {
  key: 'updateBaselineInfo',
  category: Category.WORKFLOW,
  title: 'Update Baseline Datapoints',
  description:
    'Update some (or all) of the baseline datapoints for the patient currently enrolled in the care flow.',
  fields,
  dataPoints,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const {
      settings: { apiUrl, apiKey },
      fields: { baselineInfo },
      pathway: { id: pathwayId },
    } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
        settings: SettingsValidationSchema,
        pathway: PathwayValidationSchema,
      }),
      payload,
    })

    const sdk = new AwellSdk({ apiUrl, apiKey })

    await sdk.updateBaselineInfo({
      pathway_id: pathwayId,
      baseline_info: baselineInfo,
    })

    await onComplete()
  },
}
