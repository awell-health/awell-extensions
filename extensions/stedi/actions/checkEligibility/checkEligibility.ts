import { validate, type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings, SettingsValidationSchema } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { z } from 'zod'

export const checkEligibility: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'checkEligibility',
  category: Category.BILLING,
  title: 'Check eligibility',
  description:
    'This is a dummy action that checks eligibility for a given request.',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete }): Promise<void> => {
    const { fields } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
        settings: SettingsValidationSchema,
      }),
      payload,
    })

    await onComplete({
      data_points: {
        data: fields.data,
      },
    })
  },
}
