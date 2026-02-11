import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { z } from 'zod'
import {
  addActivityEventLog,
  getLatestFormInCurrentStep,
  getAllFormsInCurrentStep,
  getFormsInTrack,
} from '../../../../../src/lib/awell'
import {
  generateFormOutput,
  type OmittedFormAnswer,
} from './lib/generateFormOutput'
import { type Form, type FormResponse } from '@awell-health/awell-sdk'

interface FormData {
  formActivityId: string
  formId: string
  formName: string
  formDefinition: Form
  formResponse: FormResponse
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
          // Get only the most recent form (last one since they're sorted by date ascending)
          forms =
            allFormsInTrack.length > 0
              ? [allFormsInTrack[allFormsInTrack.length - 1]]
              : []
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
