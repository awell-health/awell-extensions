import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import {
  fields,
  PathwayValidationSchema,
  dataPoints,
} from './config'
import { z } from 'zod'

export const getCurrentCareflowId: Action<typeof fields, typeof settings> = {
  key: 'getCurrentCareflowId',
  category: Category.WORKFLOW,
  title: 'Get current care flow ID',
  description:
    'Get the current care flow ID',
  fields,
  dataPoints,
  previewable: false,
  onEvent: async ({ payload, onComplete, helpers }): Promise<void> => {
    const {
      pathway: { id: currentCareflowId, definition_id: currentCareflowDefinitionId },
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
  },
}
