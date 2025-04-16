import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { z } from 'zod'
import {
  addActivityEventLog,
  getLatestFormInCurrentStep,
} from '../../../../../src/lib/awell'
import { generateFormOutput } from './lib/generateFormOutput'

export const listFormAnswers: Action<typeof fields, typeof settings> = {
  key: 'listFormAnswers',
  category: Category.WORKFLOW,
  title: 'List form answers',
  description: 'List form answers',
  fields,
  dataPoints,
  previewable: true,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const {
      fields: {
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

    const { formDefinition, formResponse } = await getLatestFormInCurrentStep({
      awellSdk,
      pathwayId: payload.pathway.id,
      activityId: payload.activity.id,
    })

    const { result: output, omittedFormAnswers } = generateFormOutput({
      awellSdk,
      formDefinition,
      formResponse,
      language,
      includeDescriptions,
      includeMissingAnswers,
      separator,
    })

    await onComplete({
      data_points: {
        output,
      },
      events: [
        addActivityEventLog({
          message: `Not included in the output:\n ${omittedFormAnswers.map((answer) => `${answer.questionKey}: ${answer.reason}`).join('\n')}`,
        }),
      ],
    })
  },
}
