import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { fields, PathwayValidationSchema, dataPoints } from './config'
import { z } from 'zod'

export const getCurrentCareflowId: Action<typeof fields, typeof settings> = {
  key: 'getCurrentCareflowId',
  category: Category.WORKFLOW,
  title: 'Get current care flow ID',
  description: 'Get the current care flow ID',
  fields,
  dataPoints,
  previewable: false,
  supports_automated_retries: true,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log(
      { meta, fields: payload.fields },
      'Processing getCurrentCareflowId',
    )

    try {
      const {
        pathway: {
          id: currentCareflowId,
          definition_id: currentCareflowDefinitionId,
        },
      } = validate({
        schema: z.object({
          pathway: PathwayValidationSchema,
        }),
        payload,
      })

      await onComplete({
        data_points: {
          careFlowId: currentCareflowId,
          careFlowDefinitionId: currentCareflowDefinitionId,
        },
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
