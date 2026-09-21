import { type AwellSdk } from '@awell-health/awell-sdk'
import { isEmpty, uniq } from 'lodash'

/**
 * Care flow authors copy track and step IDs from Awell Studio. Those are
 * *definition* IDs, while the orchestration queries expect the runtime IDs
 * found in an activity's context. These helpers map one to the other for a
 * given care flow. Runtime IDs passed in are matched as-is.
 *
 * Both accept several IDs and return the runtime IDs of those that were
 * activated in the care flow, so an author can list every step or track that
 * *might* have run and let the action pick up the one that did.
 */

const quote = (ids: string[]): string => ids.map((id) => `"${id}"`).join(', ')

/** Runtime IDs of the activated tracks, most recently started first. */
export const resolveTrackIds = async ({
  awellSdk,
  pathwayId,
  trackIds,
}: {
  awellSdk: AwellSdk
  pathwayId: string
  trackIds: string[]
}): Promise<string[]> => {
  const { careflowTracks } = await awellSdk.orchestration.query({
    careflowTracks: {
      __args: { careflow_id: pathwayId },
      tracks: { id: true, definition_id: true, start_date: true },
    },
  })

  const runtimeTrackIds = careflowTracks.tracks
    .filter(
      (t) => trackIds.includes(t.id) || trackIds.includes(t.definition_id),
    )
    .sort((a, b) => b.start_date.localeCompare(a.start_date))
    .map((t) => t.id)

  if (isEmpty(runtimeTrackIds)) {
    throw new Error(
      `None of the tracks ${quote(trackIds)} were found in care flow ${pathwayId}. Has one of them been activated?`,
    )
  }

  return uniq(runtimeTrackIds)
}

/** Runtime IDs of the activated steps. */
export const resolveStepIds = async ({
  awellSdk,
  pathwayId,
  stepIds,
}: {
  awellSdk: AwellSdk
  pathwayId: string
  stepIds: string[]
}): Promise<string[]> => {
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
  const runtimeStepIds = careflowActivities.activities
    .filter(
      (a) =>
        a.object.type === 'STEP' &&
        (stepIds.includes(a.object.id) ||
          stepIds.includes(a.context?.step_id ?? '')),
    )
    .map((a) => a.context?.step_id)
    .filter((id): id is string => !isEmpty(id))

  if (isEmpty(runtimeStepIds)) {
    throw new Error(
      `None of the steps ${quote(stepIds)} were found in care flow ${pathwayId}. Has one of them been activated?`,
    )
  }

  return uniq(runtimeStepIds)
}
