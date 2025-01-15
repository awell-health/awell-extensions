import {
  type AwellSdk,
  type FormResponse,
  type Form,
} from '@awell-health/awell-sdk'
import { isNil } from 'lodash'

type GetLatestFormInCurrentStepType = ({
  awellSdk,
  pathwayId,
  activityId,
}: {
  awellSdk: AwellSdk
  pathwayId: string
  activityId: string
}) => Promise<{
  formActivityId: string
  formId: string
  formDefinition: Form
  formResponse: FormResponse
}>

export const getLatestFormInCurrentStep: GetLatestFormInCurrentStepType =
  async ({ awellSdk, pathwayId, activityId }) => {
    const activityResponse = await awellSdk.orchestration.query({
      activity: {
        __args: {
          id: activityId,
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
            id: true,
            name: true,
            type: true,
          },
          context: {
            step_id: true,
          },
        },
      },
    })

    const formActivitiesInCurrentStep =
      activitiesInCurrentStepResponse.pathwayStepActivities.activities.filter(
        (a) =>
          a.object.type === 'FORM' &&
          a.status === 'DONE' &&
          a.date <= currentActivity.date,
      )

    // Grab the most recent form activity
    const formActivity = formActivitiesInCurrentStep[0]

    if (isNil(formActivity))
      throw new Error('No (completed) form action found in the current step')

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
      formDefinition: formDefinition.form.form as Form,
      formResponse: formResponse.formResponse.response as FormResponse,
    }
  }
