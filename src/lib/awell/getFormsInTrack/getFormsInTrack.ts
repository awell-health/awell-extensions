import {
  type AwellSdk,
  type Form,
  type FormResponse,
} from '@awell-health/awell-sdk'
import { isNil } from 'lodash'

export interface FormData {
  formActivityId: string
  formId: string
  formName: string
  formDefinition: Form
  formResponse: FormResponse
}

type GetFormsInTrack = (params: {
  awellSdk: AwellSdk
  pathwayId: string
  activityId: string
}) => Promise<FormData[]>

export const getFormsInTrack: GetFormsInTrack = async ({
  awellSdk,
  pathwayId,
  activityId,
}) => {
  // First get the current activity to find the track_id and cutoff date
  const activityResponse = await awellSdk.orchestration.query({
    activity: {
      __args: {
        id: activityId,
      },
      success: true,
      activity: {
        id: true,
        date: true,
        context: {
          track_id: true,
        },
      },
    },
  })

  const currentActivity = activityResponse.activity?.activity

  if (isNil(currentActivity)) {
    throw new Error('Cannot find the current activity')
  }

  const trackId = currentActivity.context?.track_id

  if (isNil(trackId) || trackId.trim() === '') {
    throw new Error('Could not find track ID for the current activity')
  }

  // Get all activities in the track
  const activitiesResponse = await awellSdk.orchestration.query({
    pathwayActivities: {
      __args: {
        pathway_id: pathwayId,
        track_id: trackId,
        pagination: { offset: 0, count: 500 },
      },
      success: true,
      activities: {
        id: true,
        status: true,
        date: true,
        object: {
          id: true,
          name: true,
          type: true,
        },
      },
    },
  })

  // Filter and sort by date in ascending order (chronological)
  const formActivitiesInTrack = activitiesResponse.pathwayActivities.activities
    .filter(
      (a) =>
        a.object.type === 'FORM' &&
        a.status === 'DONE' &&
        a.date <= currentActivity.date,
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  if (formActivitiesInTrack.length === 0) {
    return []
  }

  // Fetch form definitions and responses for all forms
  return await Promise.all(
    formActivitiesInTrack.map(async (formActivity) => {
      const formDefinition = await awellSdk.orchestration.query({
        form: {
          __args: {
            id: formActivity.object.id,
            pathway_id: pathwayId,
          },
          form: {
            __scalar: true,
            questions: {
              __scalar: true,
              options: {
                __scalar: true,
              },
            },
          },
        },
      })

      const formResponse = await awellSdk.orchestration.query({
        formResponse: {
          __args: {
            pathway_id: pathwayId,
            activity_id: formActivity.id,
          },
          response: {
            answers: {
              __scalar: true,
            },
          },
        },
      })

      return {
        formActivityId: formActivity.id,
        formId: formActivity.object.id,
        formName: formActivity.object.name,
        formDefinition: formDefinition.form.form as Form,
        formResponse: formResponse.formResponse.response as FormResponse,
      }
    }),
  )
}
