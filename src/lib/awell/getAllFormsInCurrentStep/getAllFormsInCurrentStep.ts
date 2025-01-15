import {
  type AwellSdk,
  type FormResponse,
  type Form,
  type Activity,
} from '@awell-health/awell-sdk'
import { isEmpty, isNil } from 'lodash'

type GetAllFormsInCurrentStep = ({
  awellSdk,
  pathwayId,
  activityId,
}: {
  awellSdk: AwellSdk
  pathwayId: string
  activityId: string
}) => Promise<
  Array<{
    formActivityId: string
    formId: string
    formDefinition: Form
    formResponse: FormResponse
  }>
>

export const getAllFormsInCurrentStep: GetAllFormsInCurrentStep = async ({
  awellSdk,
  pathwayId,
  activityId,
}) => {
  const activity_response = await awellSdk.orchestration
    .query({
      activity: {
        __args: {
          id: activityId,
        },
        success: true,
        activity: {
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
    .catch((error) => {
      console.error(`Failed to fetch activity ${activityId}`, error)
      throw new Error(`Failed to fetch activity ${activityId}`)
    })

  const currentActivity = activity_response?.activity?.activity

  if (isNil(currentActivity) || !activity_response.activity.success)
    throw new Error(`Failed to fetch activity ${activityId}`)

  const currentStepId = currentActivity.context?.step_id

  if (isNil(currentStepId))
    throw new Error('Could not find step ID of the current activity')

  const activities = await awellSdk.orchestration.query({
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
          type: true,
        },
        context: {
          step_id: true,
        },
      },
    },
  })

  const formActivitiesInCurrentStep =
    activities.pathwayStepActivities.activities.filter(
      (a) =>
        a.object.type === 'FORM' &&
        a.status === 'DONE' &&
        a.date <= currentActivity.date,
    )

  if (isEmpty(formActivitiesInCurrentStep)) return []

  const getFormDefinitionAndFormResponse = async (
    formActivity: Activity,
  ): Promise<{ formDefinition: Form; formResponse: FormResponse }> => {
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

  return await Promise.all(
    formActivitiesInCurrentStep.map(async (formActivity) => {
      const { formDefinition, formResponse } =
        await getFormDefinitionAndFormResponse(formActivity as Activity)

      return {
        formActivityId: formActivity.id,
        formId: formActivity.object.id,
        formDefinition,
        formResponse,
      }
    }),
  )
}
