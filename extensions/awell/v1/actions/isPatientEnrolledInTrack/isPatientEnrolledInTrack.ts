import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import {
  fields,
  FieldsValidationSchema,
  PathwayValidationSchema,
  dataPoints,
} from './config'
import z from 'zod'
import { isNil } from 'lodash'

export const isPatientEnrolledInTrack: Action<typeof fields, typeof settings> =
  {
    key: 'isPatientEnrolledInTrack',
    category: Category.WORKFLOW,
    title: 'Check patient track enrollment status',
    description:
      'Checks whether the patient is enrolled, has been enrolled, or is scheduled to be enrolled in a specific track. This is time-based and will return the status of the track at the time of the check.',
    fields,
    dataPoints,
    previewable: false,
    supports_automated_retries: true,
    onEvent: async ({ payload, onComplete, helpers }): Promise<void> => {
      const {
        fields: { trackDefinitionId },
        pathway: { id: pathwayId },
      } = validate({
        schema: z.object({
          fields: FieldsValidationSchema,
          pathway: PathwayValidationSchema,
        }),
        payload,
      })

      const sdk = await helpers.awellSdk()
      // status can be ['active', 'completed', 'stopped', 'discarded']
      const tracksResponse = await sdk.orchestration.query({
        careflowTracks: {
          __args: {
            careflow_id: pathwayId,
            statuses: ['active', 'completed'],
          },
          tracks: {
            definition_id: true,
            status: true,
            start_date: true,
            end_date: true,
          },
        },
        scheduledTracksForPathway: {
          __args: {
            pathway_id: pathwayId,
          },
          scheduled_tracks: {
            track_definition_id: true,
            scheduled_date: true,
          },
        },
      })

      const trackElements =
        tracksResponse.careflowTracks?.tracks?.filter(
          (track) => track.definition_id === trackDefinitionId,
        ) ?? []

      // Find if the patient has been enrolled in the track
      const hasBeenEnrolledInTrack = trackElements.some(
        (track) =>
          track.status === 'completed' &&
          track.end_date !== null &&
          track.end_date !== undefined,
      )

      // Find if the patient is currently enrolled in the track
      const isEnrolledInTrack = trackElements.some(
        (track) => track.status === 'active',
      )

      const scheduledTracks =
        tracksResponse.scheduledTracksForPathway?.scheduled_tracks?.filter(
          (track) => track.track_definition_id === trackDefinitionId,
        ) ?? []

      // Find if the patient is scheduled to be enrolled in the track
      const trackIsScheduled = scheduledTracks.length > 0

      let trackScheduledDate: string | null = null

      if (scheduledTracks.length > 0) {
        // Find the earliest scheduled_date among queued scheduled tracks.
        const earliestScheduledTrack = scheduledTracks.reduce(
          (earliest, current) => {
            if (isNil(earliest.scheduled_date)) return current
            if (isNil(current.scheduled_date)) return earliest
            return new Date(current.scheduled_date) <
              new Date(earliest.scheduled_date)
              ? current
              : earliest
          },
        )
        trackScheduledDate = earliestScheduledTrack.scheduled_date
      }

      await onComplete({
        data_points: {
          has_been_enrolled_in_track: hasBeenEnrolledInTrack.toString(),
          is_enrolled_in_track: isEnrolledInTrack.toString(),
          track_is_scheduled: trackIsScheduled.toString(),
          track_scheduled_date: trackScheduledDate,
        },
      })
    },
  }
