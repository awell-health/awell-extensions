import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import {
  fields,
  PathwayValidationSchema,
  FieldsValidationSchema,
} from './config'
import { z } from 'zod'
import { addActivityEventLog } from '../../../../../src/lib/awell/addEventLog'

export const stopCareFlow: Action<typeof fields, typeof settings> = {
  key: 'stopCareFlow',
  category: Category.WORKFLOW,
  title: 'Stop care flow',
  description: 'Stop the care flow the patient is currently enrolled.',
  fields,
  previewable: false, // We don't have pathways in Preview, only cases.
  onEvent: async ({ payload, onComplete, helpers }): Promise<void> => {
    const {
      fields: { reason },
      pathway: { id: pathwayId },
    } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
        pathway: PathwayValidationSchema,
      }),
      payload,
    })

    const awellSdk = await helpers.awellSdk()
    await awellSdk.orchestration.mutation({
      stopPathway: {
        __args: {
          input: {
            pathway_id: pathwayId,
            reason,
          },
        },
        code: true,
        success: true,
      },
    })

    await onComplete({
      events: [
        addActivityEventLog({
          message: `Care flow successfully stopped.`,
        }),
      ],
    })
  },
}
