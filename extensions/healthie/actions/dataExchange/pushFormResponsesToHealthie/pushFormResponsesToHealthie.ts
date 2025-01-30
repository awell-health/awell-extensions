import {
  addActivityEventLog,
  getAllFormsInCurrentStep,
} from '../../../../../src/lib/awell'
import { Category, type Action } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '../../../lib/sdk/validatePayloadAndCreateSdk'
import { type settings } from '../../../settings'
import { datapoints, fields, FieldsValidationSchema } from './config'
import { getSubActivityLogs } from './logs'
import { isEmpty, defaultTo } from 'lodash'
import {
  HealthieFormResponseNotCreated,
  parseHealthieFormResponseNotCreatedError,
} from '../shared'
import {
  HealthieError,
  mapHealthieToActivityError,
} from '../../../lib/sdk/graphql-codegen/errors'

export const pushFormResponsesToHealthie: Action<
  typeof fields,
  typeof settings,
  keyof typeof datapoints
> = {
  key: 'pushFormResponsesToHealthie',
  category: Category.DEMO,
  title: 'Push form responses to Healthie',
  description:
    'Pushes all form response from the current step to a Healthie form',
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
     * Returns an array of all form definitions and responses
     * in the current step at the time the current activity in that step is activated.
     */
    const formsData = await getAllFormsInCurrentStep({
      awellSdk,
      pathwayId: pathway.id,
      activityId: activity.id,
    })

    const formDataWithHealthieFormAnswers = formsData.map((formData) => {
      const { formAnswers: healthieFormAnswerInputs, omittedFormAnswers } =
        awellSdk.utils.healthie.awellFormResponseToHealthieFormAnswers({
          awellFormDefinition: formData.formDefinition,
          awellFormResponse: formData.formResponse,
        })

      return {
        ...formData,
        healthieFormAnswerInputs,
        omittedFormAnswers,
      }
    })

    const mergedHealthieFormAnswers = formDataWithHealthieFormAnswers.flatMap(
      ({ healthieFormAnswerInputs }) => healthieFormAnswerInputs,
    )
    const mergedOmittedFormAnswers = formDataWithHealthieFormAnswers.flatMap(
      ({ omittedFormAnswers }) => omittedFormAnswers,
    )

    // indicates whether to make form values editable in Healthie
    const lock = defaultTo(fields.lockFormAnswerGroup, false)

    /**
     * Temporary log event to see the form answers we post to Healthie
     * Added because it helps Paloma with debugging why the form answers are not being posted
     * and unfortunately the Healthie API does not provide any useful error messages
     */
    const healthieFormAnswersLog = addActivityEventLog({
      message: `Form answers:\n${JSON.stringify(mergedHealthieFormAnswers, null, 2)}`,
    })

    try {
      const res = await healthieSdk.client.mutation({
        createFormAnswerGroup: {
          __args: {
            input: {
              finished: true,
              custom_module_form_id: fields.healthieFormId,
              user_id: fields.healthiePatientId,
              form_answers: mergedHealthieFormAnswers.map((input) => ({
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
        events: getSubActivityLogs(mergedOmittedFormAnswers),
      })
    } catch (error) {
      if (error instanceof HealthieError) {
        const errors = mapHealthieToActivityError(error.errors)
        await onError({
          events: [
            ...errors,
            ...getSubActivityLogs(mergedOmittedFormAnswers),
            healthieFormAnswersLog,
          ],
        })
        return
      }

      if (error instanceof HealthieFormResponseNotCreated) {
        await onError({
          events: [
            parseHealthieFormResponseNotCreatedError(error.errors),
            ...getSubActivityLogs(mergedOmittedFormAnswers),
            healthieFormAnswersLog,
          ],
        })
        return
      }

      const err = error as Error

      await onError({
        events: [
          addActivityEventLog({
            message: `Error: ${err.message}`,
          }),
          healthieFormAnswersLog,
        ],
      })
    }
  },
}
