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
  supports_automated_retries: true,
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
    const stoppableTrackStatuses = ['active']
    const tracksResponse = await awellSdk.orchestration.query({
      careflowTracks: {
        __args: {
          careflow_id: careFlowId,
          statuses: stoppableTrackStatuses,
        },
        tracks: {
          id: true,
          status: true,
          definition_id: true,
          title: true,
        },
      },
    })
    const activeTracks =
      tracksResponse.careflowTracks?.tracks?.filter(
        (track) =>
          track.definition_id === trackDefinitionId &&
          stoppableTrackStatuses.includes(track.status),
      ) ?? []
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
            message: `Track ${activeTrack.title} with ID ${activeTrack.id} successfully stopped.`,
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
