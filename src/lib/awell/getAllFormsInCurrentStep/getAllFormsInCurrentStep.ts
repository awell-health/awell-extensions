import {
  type AwellSdk,
  type FormResponse,
  type Form,
  type Activity,
} from '@awell-health/awell-sdk'
import { isEmpty, isNil } from 'lodash'

type Log = (
  data: Record<string, unknown>,
  message: string,
  error?: Error,
) => void

const logDebug = (
  log: Log | undefined,
  message: string,
  data: Record<string, unknown>,
): void => {
  log?.(data, `[getAllFormsInCurrentStep] ${message}`)
}

type GetFormsInStep = ({
  awellSdk,
  pathwayId,
  activityId,
  stepId,
  log,
}: {
  awellSdk: AwellSdk
  pathwayId: string
  activityId: string
  /** Runtime step ID to read forms from instead of the current activity's step */
  stepId?: string
  log?: Log
}) => Promise<
  Array<{
    formActivityId: string
    formId: string
    date: string
    formDefinition: Form
    formResponse: FormResponse
  }>
>

/**
 * Returns all completed forms in a step of the care flow: the current
 * activity's step by default, or the step given by `stepId` (a runtime step ID).
 */
export const getFormsInStep: GetFormsInStep = async ({
  awellSdk,
  pathwayId,
  activityId,
  stepId,
  log,
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
      logDebug(log, 'Failed to fetch activity', {
        activityId,
        pathwayId,
        error,
      })
      throw new Error(`Failed to fetch activity ${activityId}`)
    })

  const currentActivity = activity_response?.activity?.activity

  if (isNil(currentActivity) || !activity_response.activity.success) {
    logDebug(log, 'Activity query did not return a successful activity', {
      activityId,
      pathwayId,
      activityResponse: JSON.stringify(activity_response),
    })
    throw new Error(`Failed to fetch activity ${activityId}`)
  }

  logDebug(log, 'Fetched current activity', {
    activityId: currentActivity.id,
    status: currentActivity.status,
    date: currentActivity.date,
    objectId: currentActivity.object.id,
    objectType: currentActivity.object.type,
    stepId: currentActivity.context?.step_id,
  })

  const currentStepId = stepId ?? currentActivity.context?.step_id

  if (isNil(currentStepId)) {
    logDebug(log, 'Could not find step ID of the current activity', {
      activityId,
      pathwayId,
      currentActivity: JSON.stringify(currentActivity),
    })
    throw new Error(
      `Could not find step ID of the current activity for activity ${activityId}`,
    )
  }

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

  logDebug(log, 'Fetched pathway step activities', {
    activityId,
    pathwayId,
    stepId: currentStepId,
    totalActivities: activities.pathwayStepActivities.activities.length,
  })

  // Filter and sort by date in ascending order (chronological)
  const formActivitiesInCurrentStep =
    activities.pathwayStepActivities.activities
      .filter(
        (a) =>
          a.object.type === 'FORM' &&
          a.status === 'DONE' &&
          a.date <= currentActivity.date,
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  logDebug(log, 'Selected completed form activities in current step', {
    activityId,
    pathwayId,
    stepId: currentStepId,
    selectedForms: formActivitiesInCurrentStep.map((formActivity) => ({
      formActivityId: formActivity.id,
      formId: formActivity.object.id,
      date: formActivity.date,
    })),
  })

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

    logDebug(log, 'Fetched form definition', {
      activityId,
      formActivityId: formActivity.id,
      formId: formActivity.object.id,
      questionCount: formDefinition.form.form?.questions.length ?? 0,
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

    logDebug(log, 'Fetched form response', {
      activityId,
      formActivityId: formActivity.id,
      formId: formActivity.object.id,
      answerCount: formResponse.formResponse.response.answers.length,
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
        date: formActivity.date,
        formDefinition,
        formResponse,
      }
    }),
  )
}

/** All completed forms in the current activity's step. */
export const getAllFormsInCurrentStep: GetFormsInStep = async (args) =>
  await getFormsInStep(args)
