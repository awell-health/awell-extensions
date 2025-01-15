import { type AwellSdk, type Activity } from '@awell-health/awell-sdk'
import { isNil } from 'lodash'

type GetLastCalculationActivityInCurrentStep = ({
  awellSdk,
  pathwayId,
  currentActivityId,
}: {
  awellSdk: AwellSdk
  pathwayId: string
  currentActivityId: string
}) => Promise<Activity | null>

export const getLastCalculationActivityInCurrentStep: GetLastCalculationActivityInCurrentStep =
  async ({ awellSdk, pathwayId, currentActivityId }) => {
    const activityResponse = await awellSdk.orchestration.query({
      activity: {
        __args: {
          id: currentActivityId,
        },
        success: true,
        activity: {
          date: true,
          context: {
            step_id: true,
          },
        },
      },
    })

    const currentActivity = activityResponse.activity?.activity

    if (isNil(currentActivity))
      throw new Error('Cannot find the current activity')

    const currentStepId = activityResponse.activity?.activity?.context?.step_id

    if (isNil(currentStepId))
      throw new Error('Could not find step ID of the current activity')

    const activitiesInCurrentStepResponse = await awellSdk.orchestration.query({
      pathwayStepActivities: {
        __args: {
          pathway_id: pathwayId,
          step_id: currentStepId,
        },
        success: true,
        activities: {
          id: true,
          status: true,
          date: true,
          object: {
            name: true,
            type: true,
          },
          context: {
            step_id: true,
          },
        },
      },
    })

    const calculationActivitiesInCurrentStep =
      activitiesInCurrentStepResponse.pathwayStepActivities.activities.filter(
        (a) =>
          a.object.type === 'CALCULATION' &&
          a.status === 'DONE' &&
          a.date <= currentActivity.date,
      )

    // Grab the most recent calculation activity
    const calculationActivity = calculationActivitiesInCurrentStep[0]

    if (isNil(calculationActivity)) return null

    return calculationActivity as Activity
  }
