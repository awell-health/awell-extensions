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

export const addAdhocTrack: Action<typeof fields, typeof settings> = {
  key: 'addAdhocTrack',
  category: Category.WORKFLOW,
  title: 'Add ad hoc track',
  description: 'Add a pre-configured ad hoc track to a patient care flow.',
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
      addTrack: {
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
          message: `Ad hoc track successfully added to care flow.`,
        }),
      ],
    })
  },
}
