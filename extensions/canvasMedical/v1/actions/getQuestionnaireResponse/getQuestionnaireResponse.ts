import { validate, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category } from '@awell-health/extensions-core'
import { fields, dataPoints, fieldsValidationSchema } from './config'
import {
  isAxiosError,
  isZodError,
  parseAxiosError,
  parseUnknowError,
  parseZodError,
} from '../../utils'
import { z } from 'zod'
import { type AxiosError } from 'axios'
import { makeAPIClient } from '../../client'
import { idSchema } from '../../validation'

export const getQuestionnaireResponse: Action<typeof fields, typeof settings> =
  {
    key: 'getQuestionnaireResponse',
    category: Category.EHR_INTEGRATIONS,
    title: 'Get Questionnaire Response',
    description: "Retrieve a patient profile using Canvas's patient API.",
    fields,
    dataPoints,
    previewable: true,
    onActivityCreated: async (payload, onComplete, onError) => {
      try {
        validate({
          schema: z.object({
            fields: fieldsValidationSchema,
          }),
          payload,
        })

        const questionnaireResponseId = idSchema.parse(
          payload.fields.questionnaireResponseId
        )

        const api = makeAPIClient(payload.settings)
        const questionnaireResponseData = await api.getQuestionnaireResponse(
          questionnaireResponseId
        )

        await onComplete({
          data_points: {
            questionnaireResponseData: JSON.stringify(
              questionnaireResponseData
            ),
          },
        })
      } catch (error) {
        let parsedError

        if (isZodError(error)) {
          parsedError = parseZodError(error)
        } else if (isAxiosError(error)) {
          parsedError = parseAxiosError(error as AxiosError)
        } else {
          parsedError = parseUnknowError(error as Error)
        }
        await onError({
          events: [parsedError],
        })
      }
    },
  }
