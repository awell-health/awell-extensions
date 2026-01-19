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
  previewable: false,
  onEvent: async ({ payload, onComplete, helpers }): Promise<void> => {
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

    const awellSdk = await helpers.awellSdk()
    const events = []
    if (careFlowIds.length > 0) {
      for (const careFlowId of careFlowIds) {
        await awellSdk.orchestration.mutation({
          stopPathway: {
            __args: {
              input: {
                pathway_id: careFlowId,
                reason,
              },
            },
            code: true,
            success: true,
          },
        })
        events.push(
          addActivityEventLog({
            message: `Care flow ${careFlowId} successfully stopped.`,
          }),
        )
        // wait 1 second for rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    } else {
      await awellSdk.orchestration.mutation({
        stopPathway: {
          __args: {
            input: {
              pathway_id: currentCareFlowId,
              reason,
            },
          },
          code: true,
          success: true,
        },
      })
      events.push(
        addActivityEventLog({
          message: `Care flow ${currentCareFlowId} successfully stopped.`,
        }),
      )
    }

    await onComplete({
      events,
    })
  },
}
