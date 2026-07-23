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
  category: Category.EHR_INTEGRATIONS,
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
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }
    const log = (
      data: Record<string, unknown>,
      message: string,
      error?: Error,
    ): void => {
      helpers.log({ ...data, meta }, message, error)
    }

    const awellSdk = await helpers.awellSdk()

    /**
     * Returns an array of all form definitions and responses
     * in the current step at the time the current activity in that step is activated.
     */
    const formsData = await getAllFormsInCurrentStep({
      awellSdk,
      pathwayId: pathway.id,
      activityId: activity.id,
      log,
    })

    helpers.log(
      {
        meta,
        formsData,
      },
      '[pushFormResponsesToHealthie] Forms data',
    )

    const formDataWithHealthieFormAnswers = formsData.map((formData) => {
      helpers.log(
        {
          meta,
          formActivityId: formData.formActivityId,
          formId: formData.formId,
        },
        '[pushFormResponsesToHealthie] Mapping Awell form response to Healthie form answers',
      )
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

    helpers.log(
      {
        meta,
        mergedHealthieFormAnswers,
        mergedOmittedFormAnswers,
      },
      '[pushFormResponsesToHealthie] Merged Healthie form answers and omitted form answers',
    )

    // indicates whether to make form values editable in Healthie
    const lock = defaultTo(fields.lockFormAnswerGroup, false)

    helpers.log(
      {
        meta,
        lock,
      },
      '[pushFormResponsesToHealthie] Indicates whether to make form values editable in Healthie',
    )

    /**
     * Temporary log event to see the form answers we post to Healthie
     * Added because it helps Paloma with debugging why the form answers are not being posted
     * and unfortunately the Healthie API does not provide any useful error messages
     */
    const healthieFormAnswersLog = addActivityEventLog({
      message: `Form answers:\n${JSON.stringify(mergedHealthieFormAnswers, null, 2)}`,
    })

    helpers.log(
      {
        meta,
        healthieFormAnswersLog,
      },
      '[pushFormResponsesToHealthie] Healthie form answers log',
    )

    try {
      const createFormAnswerGroupInput = {
        finished: true,
        custom_module_form_id: fields.healthieFormId,
        user_id: fields.healthiePatientId,
        form_answers: mergedHealthieFormAnswers.map((input) => ({
          ...input,
          user_id: fields.healthiePatientId,
        })),
      }

      helpers.log(
        { meta, createFormAnswerGroupInput },
        '[pushFormResponsesToHealthie] Creating Healthie form answer group',
      )

      const res = await healthieSdk.client.mutation({
        createFormAnswerGroup: {
          __args: {
            input: createFormAnswerGroupInput,
          },
          form_answer_group: {
            id: true,
          },
        },
      })
      const formAnswerGroupId =
        res?.createFormAnswerGroup?.form_answer_group?.id

      if (isEmpty(formAnswerGroupId)) {
        helpers.log(
          {
            meta,
            formAnswerGroupId,
          },
          '[pushFormResponsesToHealthie] Form answer group ID is empty',
        )
        throw new HealthieFormResponseNotCreated(res)
      }

      // separate call to lock the form if needed
      if (lock && formAnswerGroupId !== undefined) {
        const lockFormAnswerGroupInput = {
          id: formAnswerGroupId,
        }

        helpers.log(
          { meta, lockFormAnswerGroupInput },
          '[pushFormResponsesToHealthie] Locking Healthie form answer group',
        )

        await healthieSdk.client.mutation({
          lockFormAnswerGroup: {
            __args: {
              input: lockFormAnswerGroupInput,
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
      helpers.log(
        { meta, error },
        '[pushFormResponsesToHealthie] Error when pushing form responses to Healthie',
      )
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
