import {
  type AwellSdk,
  type FormResponse,
  type Form,
} from '@awell-health/awell-sdk'
import { isNil } from 'lodash'

type GetLatestFormInStep = ({
  awellSdk,
  pathwayId,
  activityId,
}: {
  awellSdk: AwellSdk
  pathwayId: string
  activityId: string
}) => Promise<{
  formDefinition: Form
  formResponse: FormResponse
}>

export const getLatestFormInStep: GetLatestFormInStep = async ({
  awellSdk,
  pathwayId,
  activityId,
}) => {
  const activities = await awellSdk.orchestration.query({
    pathwayActivities: {
      __args: {
        pathway_id: pathwayId,
      },
      success: true,
      activities: {
        id: true,
        status: true,
        date: true,
        object: {
          id: true,
          type: true,
        },
        context: {
          step_id: true,
        },
      },
    },
  })

  const currentActivity = activities.pathwayActivities.activities.find(
    (a) => a.id === activityId
  )

  if (isNil(currentActivity))
    throw new Error('Cannot find the current activity')

  const currentStepId = currentActivity.context?.step_id

  if (isNil(currentStepId))
    throw new Error('Could not find step ID of the current activity')

  const formActivitiesInCurrentStep =
    activities.pathwayActivities.activities.filter(
      (a) =>
        a.context?.step_id === currentStepId &&
        a.object.type === 'FORM' &&
        a.status === 'DONE' &&
        a.date <= currentActivity.date
    )

  // Grab the most recent form activity
  const formActivity = formActivitiesInCurrentStep[0]

  if (isNil(formActivity))
    throw new Error('No (completed) form action found in the current step')

  const formDefinition = await awellSdk.orchestration.query({
    form: {
      __args: {
        id: formActivity.object.id,
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
    formDefinition: formDefinition.form.form as Form,
    formResponse: formResponse.formResponse.response as FormResponse,
  }
}
