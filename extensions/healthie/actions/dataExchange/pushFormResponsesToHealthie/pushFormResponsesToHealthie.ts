import { getAllFormsInCurrentStep } from '../../../../../src/lib/awell'
import { Category, type Action } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '../../../lib/sdk/validatePayloadAndCreateSdk'
import { type settings } from '../../../settings'
import { datapoints, fields, FieldsValidationSchema } from './config'
import { getSubActivityLogs } from './logs'
import { isEmpty } from 'lodash'
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
      ({ healthieFormAnswerInputs }) => healthieFormAnswerInputs
    )
    const mergedOmittedFormAnswers = formDataWithHealthieFormAnswers.flatMap(
      ({ omittedFormAnswers }) => omittedFormAnswers
    )

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

      if (isEmpty(res?.createFormAnswerGroup?.form_answer_group?.id))
        throw new HealthieFormResponseNotCreated(res)

      await onComplete({
        data_points: {
          formAnswerGroupId: String(
            res.createFormAnswerGroup?.form_answer_group?.id
          ),
        },
        events: getSubActivityLogs(mergedOmittedFormAnswers),
      })
    } catch (error) {
      if (error instanceof HealthieError) {
        const errors = mapHealthieToActivityError(error.errors)
        await onError({
          events: [...errors, ...getSubActivityLogs(mergedOmittedFormAnswers)],
        })
      } else if (error instanceof HealthieFormResponseNotCreated) {
        await onError({
          events: [
            parseHealthieFormResponseNotCreatedError(error.errors),
            ...getSubActivityLogs(mergedOmittedFormAnswers),
          ],
        })
      } else {
        throw error
      }
    }
  },
}
