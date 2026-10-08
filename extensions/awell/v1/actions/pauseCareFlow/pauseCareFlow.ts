import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import {
  fields,
  PathwayValidationSchema,
  FieldsValidationSchema,
} from './config'
import { z } from 'zod'
import AwellSdk from '../../sdk/awellSdk'
import { addActivityEventLog } from '../../../../../src/lib/awell/addEventLog'

export const pauseCareFlow: Action<typeof fields, typeof settings> = {
  key: 'pauseCareFlow',
  category: Category.WORKFLOW,
  title: 'Pause care flow',
  description:
    'Pause a care flow. While paused, nothing in the care flow progresses: no new steps, messages, forms or actions are activated. Timers keep counting from their original start, so a timer that is due during the pause fires as soon as the care flow is resumed. Resume with the "Unpause care flow" action or the unpauseCareFlow API mutation.',
  fields,
  previewable: false,
  supports_automated_retries: true,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    helpers.log({ fields: payload.fields }, 'Processing pauseCareFlow')

    try {
      const {
        fields: { careFlowIds, reason },
        pathway: { id: currentCareFlowId },
      } = validate({
        schema: z.object({
          fields: FieldsValidationSchema,
          pathway: PathwayValidationSchema,
        }),
        payload,
      })

      const { apiKey, apiUrl } = await helpers.awellSdk()
      const sdk = new AwellSdk({ apiKey, apiUrl: apiUrl as string })

      const idsToPause =
        careFlowIds.length > 0 ? careFlowIds : [currentCareFlowId]
      const events = []

      for (const [index, careFlowId] of idsToPause.entries()) {
        await sdk.pauseCareFlow({ careflow_id: careFlowId, reason })
        events.push(
          addActivityEventLog({
            message: `Care flow ${careFlowId} successfully paused.`,
          }),
        )
        // wait 1 second between calls for rate limiting
        if (index < idsToPause.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }

      await onComplete({
        events,
      })
    } catch (err) {
      helpers.log({ err }, 'error', err as Error)
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
