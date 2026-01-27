import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { z } from 'zod'
import {
  addActivityEventLog,
  getLatestFormInCurrentStep,
  getAllFormsInCurrentStep,
} from '../../../../../src/lib/awell'
import {
  generateFormOutput,
  type OmittedFormAnswer,
} from './lib/generateFormOutput'
import {
  type AwellSdk,
  type Form,
  type FormResponse,
} from '@awell-health/awell-sdk'
import { isNil } from 'lodash'

interface FormData {
  formActivityId: string
  formId: string
  formName: string
  formDefinition: Form
  formResponse: FormResponse
}

const getFormsInTrack = async ({
  awellSdk,
  pathwayId,
  activityId,
}: {
  awellSdk: AwellSdk
  pathwayId: string
  activityId: string
}): Promise<FormData[]> => {
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

  const formActivitiesInTrack =
    activitiesResponse.pathwayActivities.activities.filter(
      (a) =>
        a.object.type === 'FORM' &&
        a.status === 'DONE' &&
        a.date <= currentActivity.date,
    )

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

export const listFormAnswers: Action<typeof fields, typeof settings> = {
  key: 'listFormAnswers',
  category: Category.WORKFLOW,
  title: 'List form answers',
  description: 'List form answers',
  fields,
  dataPoints,
  previewable: false,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const {
      fields: {
        scope,
        formSelection,
        language,
        includeDescriptions,
        includeMissingAnswers,
        separator,
      },
    } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
      }),
      payload,
    })

    const awellSdk = await helpers.awellSdk()

    try {
      let forms: FormData[] = []

      if (scope === 'Step') {
        if (formSelection === 'Latest') {
          const result = await getLatestFormInCurrentStep({
            awellSdk,
            pathwayId: payload.pathway.id,
            activityId: payload.activity.id,
          })
          forms = [
            {
              ...result,
              formName: result.formDefinition.title,
            },
          ]
        } else {
          const results = await getAllFormsInCurrentStep({
            awellSdk,
            pathwayId: payload.pathway.id,
            activityId: payload.activity.id,
          })
          forms = results.map((result) => ({
            ...result,
            formName: result.formDefinition.title,
          }))
        }
      } else {
        // scope === 'Track'
        const allFormsInTrack = await getFormsInTrack({
          awellSdk,
          pathwayId: payload.pathway.id,
          activityId: payload.activity.id,
        })

        if (formSelection === 'Latest') {
          // Get only the most recent form (first one since they're sorted by date desc)
          forms = allFormsInTrack.length > 0 ? [allFormsInTrack[0]] : []
        } else {
          forms = allFormsInTrack
        }
      }

      if (forms.length === 0) {
        await onComplete({
          data_points: {
            output: '(No form response)',
            numberOfFormsCaptured: '0',
          },
          events: [
            addActivityEventLog({
              message: `No (completed) form action found in the current ${scope.toLowerCase()}`,
            }),
          ],
        })
        return
      }

      const allOmittedFormAnswers: OmittedFormAnswer[] = []
      const formOutputs: string[] = []

      const useFormHeaders = formSelection === 'All'

      for (const form of forms) {
        const { result: formOutput, omittedFormAnswers } = generateFormOutput({
          awellSdk,
          formDefinition: form.formDefinition,
          formResponse: form.formResponse,
          language,
          includeDescriptions,
          includeMissingAnswers,
          separator,
        })

        const outputWithHeader = useFormHeaders
          ? `=== ${form.formName} ===\n\n${formOutput}`
          : formOutput
        formOutputs.push(outputWithHeader)
        allOmittedFormAnswers.push(...omittedFormAnswers)
      }

      const output = formOutputs.join('\n\n')

      await onComplete({
        data_points: {
          output,
          numberOfFormsCaptured: String(forms.length),
        },
        events: [
          addActivityEventLog({
            message:
              allOmittedFormAnswers.length > 0
                ? `Not included in the output:\n ${allOmittedFormAnswers.map((answer) => `${answer.questionKey}: ${answer.reason}`).join('\n')}`
                : 'All form answers were included in the output',
          }),
        ],
      })
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'No (completed) form action found in the current step'
      ) {
        await onComplete({
          data_points: {
            output: '(No form response)',
            numberOfFormsCaptured: '0',
          },
          events: [
            addActivityEventLog({
              message: error.message,
            }),
          ],
        })
      } else {
        await onError({
          events: [
            addActivityEventLog({
              message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            }),
          ],
        })
      }
    }
  },
}
