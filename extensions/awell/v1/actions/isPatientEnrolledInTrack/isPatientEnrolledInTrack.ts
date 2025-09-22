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
import { ElementType, ElementStatus } from '../../gql/graphql'
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

      const elementsResponse = await sdk.orchestration.query({
        pathwayElements: {
          __args: {
            pathway_id: pathwayId,
          },
          elements: {
            definition_id: true,
            type: true,
            status: true,
            start_date: true,
            end_date: true,
          },
        },
      })

      // Filter for track elements that match the specified definition ID
      const trackElements =
        elementsResponse.pathwayElements?.elements?.filter(
          (element) =>
            element.type === ElementType.Track &&
            element.definition_id === trackDefinitionId,
        ) ?? []

      // Find if the patient has been enrolled in the track
      const hasBeenEnrolledInTrack = trackElements.some(
        (track) =>
          track.status === ElementStatus.Done &&
          track.end_date !== null &&
          track.end_date !== undefined,
      )

      // Find if the patient is currently enrolled in the track
      const isEnrolledInTrack = trackElements.some(
        (track) => track.status === ElementStatus.Active,
      )

      // Find if the patient is scheduled to be enrolled in the track
      const trackIsScheduled = trackElements.some(
        (track) => track.status === ElementStatus.Scheduled,
      )

      // Find the earliest scheduled date among scheduled tracks
      const scheduledTracks = trackElements.filter(
        (track) => track.status === ElementStatus.Scheduled,
      )

      let trackScheduledDate: string | null = null

      if (scheduledTracks.length > 0) {
        // Find the earliest start_date among scheduled tracks
        const earliestScheduledTrack = scheduledTracks.reduce(
          (earliest, current) => {
            if (isNil(earliest.start_date)) return current
            if (isNil(current.start_date)) return earliest
            return new Date(current.start_date) < new Date(earliest.start_date)
              ? current
              : earliest
          },
        )
        trackScheduledDate = earliestScheduledTrack.start_date
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
