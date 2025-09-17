import { Category, validate, type Action } from '@awell-health/extensions-core'
import { z } from 'zod'
import { addActivityEventLog } from '../../../../../src/lib/awell/addEventLog'
import { type settings } from '../../../settings'
import {
  fields,
  FieldsValidationSchema,
  PathwayValidationSchema,
} from './config'

export const stopTrack: Action<typeof fields, typeof settings> = {
  key: 'stopTrack',
  category: Category.WORKFLOW,
  title: 'Stop track',
  description: 'Stop a track in a patient care flow (pathway).',
  fields,
  previewable: false, // We don't have pathways in Preview, only cases.
  onEvent: async ({ payload, onComplete, helpers }): Promise<void> => {
    const {
      fields: { trackDefinitionId },
      pathway: { id: careFlowId },
    } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
        pathway: PathwayValidationSchema,
      }),
      payload,
    })

    const awellSdk = await helpers.awellSdk()
    const elementsResponse = await awellSdk.orchestration.query({
      pathwayElements: {
        __args: {
          pathway_id: careFlowId,
        },
        elements: {
          id: true,
          status: true,
          definition_id: true,
          name: true,
        },
      },
    })
    const activeTracks = elementsResponse.pathwayElements?.elements?.filter(
      (element) =>
        element.definition_id === trackDefinitionId &&
        (element.status === 'ACTIVE' ||
          element.status === 'SCHEDULED' ||
          element.status === 'POSTPONED'),
    )
    if (activeTracks.length > 0) {
      const events = []
      for (const activeTrack of activeTracks) {
        await awellSdk.orchestration.mutation({
          stopTrack: {
            __args: {
              input: {
                track_id: activeTrack.id,
                pathway_id: careFlowId,
              },
            },
            code: true,
            success: true,
          },
        })
        events.push(
          addActivityEventLog({
            message: `Track ${activeTrack.name} with ID ${activeTrack.id} successfully stopped.`,
          }),
        )
      }
      await onComplete({
        events,
      })
    } else {
      await onComplete({
        events: [
          addActivityEventLog({
            message: `No active track found with definition ID ${trackDefinitionId} in care flow ${careFlowId}.`,
          }),
        ],
      })
    }
  },
}
