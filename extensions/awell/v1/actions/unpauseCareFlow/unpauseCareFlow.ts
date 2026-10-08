import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { fields, FieldsValidationSchema } from './config'
import { z } from 'zod'
import AwellSdk from '../../sdk/awellSdk'
import { addActivityEventLog } from '../../../../../src/lib/awell/addEventLog'

export const unpauseCareFlow: Action<typeof fields, typeof settings> = {
  key: 'unpauseCareFlow',
  category: Category.WORKFLOW,
  title: 'Unpause care flow',
  description:
    'Resume one or more paused care flows. Anything that became due while paused (timers that ran out, steps waiting to activate) is processed immediately on resume. Timers are not extended by the pause.',
  fields,
  previewable: false,
  supports_automated_retries: true,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    helpers.log({ fields: payload.fields }, 'Processing unpauseCareFlow')

    try {
      const {
        fields: { careFlowIds },
      } = validate({
        schema: z.object({
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      const { apiKey, apiUrl } = await helpers.awellSdk()
      const sdk = new AwellSdk({ apiKey, apiUrl: apiUrl as string })
      const events = []

      for (const [index, careFlowId] of careFlowIds.entries()) {
        await sdk.unpauseCareFlow({ careflow_id: careFlowId })
        events.push(
          addActivityEventLog({
            message: `Care flow ${careFlowId} successfully unpaused.`,
          }),
        )
        // wait 1 second between calls for rate limiting
        if (index < careFlowIds.length - 1) {
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
