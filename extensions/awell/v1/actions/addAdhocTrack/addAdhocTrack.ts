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
  previewable: false,
  supports_automated_retries: true,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log({ meta, fields: payload.fields }, 'Processing addAdhocTrack')

    try {
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
