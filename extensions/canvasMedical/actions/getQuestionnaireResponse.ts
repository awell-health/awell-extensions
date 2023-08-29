import { z, ZodError } from 'zod'
import {
  FieldType,
  type Action,
  type DataPointDefinition,
  type Fields,
} from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../settings'
import { makeAPIClient } from '../client'
import type schemas from '../schemas'
import { fromZodError } from 'zod-validation-error'
import { AxiosError } from 'axios'

const fields = {
  questionnaireResponseId: {
    id: 'questionnaireResponseId',
    label: 'Questionnaire Response Id',
    description: 'The FHIR resource id for the QuestionnaireResponse resource',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Fields<typeof schemas>

const dataPoints = {
  questionnaire_response_data: {
    key: 'questionnaire_response_data',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition<typeof schemas>>

export const getQuestionnaireResponse: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints,
  typeof schemas
> = {
  key: 'getQuestionnaireResponse',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get Questionnaire Response',
  description: "Retrieve a patient profile using Canvas's patient API.",
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const questionnaireResponseId = z
        .string()
        .parse(payload.fields.questionnaireResponseId)

      // API Call should produce AuthError or something dif.
      const api = makeAPIClient(payload.settings)
      const questionnaireResponse = await api.getQuestionnaireResponse(
        questionnaireResponseId
      )
      await onComplete({
        data_points: {
          questionnaire_response_data: JSON.stringify(questionnaireResponse),
        },
      })
    } catch (err) {
      if (err instanceof ZodError) {
        const error = fromZodError(err)
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: error.message },
              error: {
                category: 'WRONG_INPUT',
                message: error.message,
              },
            },
          ],
        })
      } else if (err instanceof AxiosError) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: {
                en: `${err.status ?? '(no status code)'} Error: ${err.message}`,
              },
              error: {
                category: 'SERVER_ERROR',
                message: `${err.status ?? '(no status code)'} Error: ${
                  err.message
                }`,
              },
            },
          ],
        })
      } else {
        const message = (err as Error).message
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: message },
              error: {
                category: 'SERVER_ERROR',
                message,
              },
            },
          ],
        })
      }
    }
  },
}
