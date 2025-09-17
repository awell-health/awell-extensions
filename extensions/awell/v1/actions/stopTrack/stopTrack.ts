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

export const stopTrack: Action<typeof fields, typeof settings> = {
  key: 'stopTrack',
  category: Category.WORKFLOW,
  title: 'Stop track',
  description: 'Stop a track in a patient care flow (pathway).',
  fields,
  previewable: false, // We don't have pathways in Preview, only cases.
  onEvent: async ({ payload, onComplete, helpers }): Promise<void> => {
    const {
      fields: { trackId },
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
      stopTrack: {
        __args: {
          input: {
            track_id: trackId,
            pathway_id: pathwayId,
          },
        },
        code: true,
        success: true,
      },
    })

    await onComplete({
      events: [
        addActivityEventLog({
          message: `Track successfully stopped.`,
        }),
      ],
    })
  },
}
