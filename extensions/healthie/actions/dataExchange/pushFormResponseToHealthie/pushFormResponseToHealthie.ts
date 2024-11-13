import { getLatestFormInCurrentStep } from '../../../../../src/lib/awell'
import { Category, type Action } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '../../../lib/sdk/validatePayloadAndCreateSdk'
import { type settings } from '../../../settings'
import { datapoints, fields, FieldsValidationSchema } from './config'
import { getSubActivityLogs } from './logs'
import { isEmpty, defaultTo } from 'lodash'
import {
  HealthieFormResponseNotCreated,
  parseHealthieFormResponseNotCreatedError,
} from '../shared/errors'
import {
  HealthieError,
  mapHealthieToActivityError,
} from '../../../lib/sdk/graphql-codegen/errors'

export const pushFormResponseToHealthie: Action<
  typeof fields,
  typeof settings,
  keyof typeof datapoints
> = {
  key: 'pushFormResponseToHealthie',
  category: Category.DEMO,
  title: 'Push form response to Healthie',
  description: 'Pushes an Awell form response to a Healthie form',
  fields,
  previewable: false,
  dataPoints: datapoints,
  onEvent: async ({ payload, onComplete, onError, helpers }) => {
    const { fields, pathway, activity, healthieSdk } =
      await validatePayloadAndCreateSdk({
        fieldsSchema: FieldsValidationSchema,
        payload,
      })

    const awellSdk = await helpers.awellSdk()

    /**
     * Returns the last completed form in a step at the time
     * the current activity in that step is activated.
     *
     * Example:
     * - Form 1 (completed)
     * - Form 2 (completed)
     * - Current activity
     * - Form 3 (not activated yet thus not-completed)
     *
     * Outcome:
     * Will return the `formDefinition` and `formResponse` of Form 2.
     */
    const { formDefinition, formResponse } = await getLatestFormInCurrentStep({
      awellSdk,
      pathwayId: pathway.id,
      activityId: activity.id,
    })

    const { formAnswers: healthieFormAnswerInputs, omittedFormAnswers } =
      awellSdk.utils.healthie.awellFormResponseToHealthieFormAnswers({
        awellFormDefinition: formDefinition,
        awellFormResponse: formResponse,
      })

    // indicates whether to make form values editable in Healthie
    const lock = defaultTo(fields.lockFormAnswerGroup, false)

    try {
      const res = await healthieSdk.client.mutation({
        createFormAnswerGroup: {
          __args: {
            input: {
              finished: true,
              custom_module_form_id: fields.healthieFormId,
              user_id: fields.healthiePatientId,
              form_answers: healthieFormAnswerInputs.map((input) => ({
                ...input,
                user_id: fields.healthiePatientId,
              })),
            },
          },
          form_answer_group: {
            id: true,
          },
        },
      })
      const formAnswerGroupId =
        res?.createFormAnswerGroup?.form_answer_group?.id

      if (isEmpty(formAnswerGroupId))
        throw new HealthieFormResponseNotCreated(res)

      // separate call to lock the form if needed
      if (lock && formAnswerGroupId !== undefined) {
        await healthieSdk.client.mutation({
          lockFormAnswerGroup: {
            __args: {
              input: {
                id: formAnswerGroupId,
              },
            },
            form_answer_group: {
              id: true,
            },
          },
        })
      }

      await onComplete({
        data_points: {
          formAnswerGroupId: String(formAnswerGroupId),
        },
        events: getSubActivityLogs(omittedFormAnswers),
      })
    } catch (error) {
      if (error instanceof HealthieError) {
        const errors = mapHealthieToActivityError(error.errors)
        await onError({
          events: [...errors, ...getSubActivityLogs(omittedFormAnswers)],
        })
      } else if (error instanceof HealthieFormResponseNotCreated) {
        await onError({
          events: [
            parseHealthieFormResponseNotCreatedError(error.errors),
            ...getSubActivityLogs(omittedFormAnswers),
          ],
        })
      } else {
        throw error
      }
    }
  },
}
