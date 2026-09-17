import { type AwellSdk } from '@awell-health/awell-sdk'
import { isNil } from 'lodash'

/**
 * Care flow authors copy track and step IDs from Awell Studio. Those are
 * *definition* IDs, while the orchestration queries expect the runtime IDs
 * found in an activity's context. These helpers map one to the other for a
 * given care flow. A runtime ID passed in is returned unchanged.
 */

export const resolveTrackId = async ({
  awellSdk,
  pathwayId,
  trackId,
}: {
  awellSdk: AwellSdk
  pathwayId: string
  trackId: string
}): Promise<string> => {
  const { careflowTracks } = await awellSdk.orchestration.query({
    careflowTracks: {
      __args: { careflow_id: pathwayId },
      tracks: { id: true, definition_id: true },
    },
  })

  const track = careflowTracks.tracks.find(
    (t) => t.id === trackId || t.definition_id === trackId,
  )

  if (isNil(track)) {
    throw new Error(
      `Track "${trackId}" not found in care flow ${pathwayId}. Has the track been activated?`,
    )
  }

  return track.id
}

export const resolveStepId = async ({
  awellSdk,
  pathwayId,
  stepId,
}: {
  awellSdk: AwellSdk
  pathwayId: string
  stepId: string
}): Promise<string> => {
  const { careflowActivities } = await awellSdk.orchestration.query({
    careflowActivities: {
      __args: {
        pathway_id: pathwayId,
        filters: { activity_type: ['STEP'] },
        pagination: { offset: 0, count: 500 },
      },
      activities: {
        object: { id: true, type: true },
        context: { step_id: true },
      },
    },
  })

  // A STEP activity's object.id is the Studio definition ID; its context holds the runtime ID
  const stepActivity = careflowActivities.activities.find(
    (a) =>
      a.object.type === 'STEP' &&
      (a.object.id === stepId || a.context?.step_id === stepId),
  )
  const runtimeStepId = stepActivity?.context?.step_id

  if (isNil(runtimeStepId)) {
    throw new Error(
      `Step "${stepId}" not found in care flow ${pathwayId}. Has the step been activated?`,
    )
  }

  return runtimeStepId
}
