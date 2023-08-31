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
import { creatingQuestionnaireResponsesSchema } from '../../validation'

export const createQuestionnaireResponses: Action<
  typeof fields,
  typeof settings
> = {
  key: 'createQuestionnaireResponses',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create a response to a questionnaire',
  description: 'Create a response to a questionnaire',
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

      const { questionnaireId, subjectId, authorId, authored, item } =
        payload.fields

      const questionnaireResponses = creatingQuestionnaireResponsesSchema.parse(
        createPayload(
          questionnaireId as string,
          subjectId as string,
          authored,
          authorId,
          JSON.parse(item as string)
        )
      )

      const api = makeAPIClient(payload.settings)
      const questionnaireResponseId = await api.createQuestionnaireResponses(
        questionnaireResponses
      )

      await onComplete({
        data_points: {
          questionnaireResponseId,
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

const createPayload = (
  questionnaireId?: string,
  subjectId?: string,
  authored?: string,
  authorId?: string,
  item?: any[]
): any => {
  const payload = {
    resourceType: 'QuestionnaireResponse' as 'QuestionnaireResponse',
    questionnaire:
      questionnaireId !== undefined
        ? `Questionnaire/${questionnaireId}`
        : undefined,
    subject:
      subjectId !== undefined
        ? {
            reference: `Patient/${subjectId}`,
          }
        : undefined,
    item,
    authored,
    author:
      authorId !== undefined
        ? {
            reference: `Practitioner/${authorId}`,
          }
        : undefined,
  }

  return payload
}
