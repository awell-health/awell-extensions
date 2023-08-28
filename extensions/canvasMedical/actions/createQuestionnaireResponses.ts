/* eslint-disable @typescript-eslint/naming-convention */
import { ZodError } from 'zod'
import {
  FieldType,
  type Action,
  type DataPointDefinition,
  type Fields,
} from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../settings'
import { makeAPIClient } from '../client'
import { fromZodError } from 'zod-validation-error'
import { AxiosError } from 'axios'
import { creatingQuestionnaireResponsesSchema } from '../validation/dto/questionnaireResponses.zod'
import type schemas from '../schemas'

const fields = {
  questionnaireId: {
    id: 'questionnaireId',
    label: 'QuestionnaireId',
    description:
      'Reference to the Canvas Questionnaire using the questionnaire id',
    type: FieldType.STRING,
    required: true,
  },
  subjectId: {
    id: 'subjectId',
    label: 'SubjectId',
    description: 'Reference to the Canvas Patient using the patient id',
    type: FieldType.STRING,
    required: true,
  },
  authored: {
    id: 'authored',
    label: 'Authored',
    description:
      'Timestamp the Questionnaire response was filled out (If omitted the current timestamp at data ingestion will be used)',
    type: FieldType.STRING,
    required: false,
  },
  authorId: {
    id: 'authorId',
    label: 'AuthorId',
    description:
      'Reference to the patient or practitioner filling out the questionnaire. If omitted it will default to Canvas Bot',
    type: FieldType.STRING,
    required: false,
  },
  item: {
    id: 'item',
    label: 'Item',
    description: 'List of answers to questions in the questionnaire',
    type: FieldType.JSON,
    required: true,
  },
} satisfies Fields<typeof schemas>

const dataPoints = {
  taskId: {
    key: 'QuestionnaireResponseId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

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

export const createQuestionnaireResponses: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints,
  typeof schemas
> = {
  key: 'createQuestionnaireResponses',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create a response to a questionnaire',
  description: 'Create a response to a questionnaire',
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
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

      // API Call should produce AuthError or something dif.
      const api = makeAPIClient(payload.settings)
      const { id } = await api.createQuestionnaireResponses(
        questionnaireResponses
      )
      await onComplete({
        data_points: {
          taskId: String(id),
        },
      })
    } catch (err) {
      console.log(err)
      if (err instanceof ZodError) {
        const error = fromZodError(err)
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: error.message },
              error: {
                category: 'SERVER_ERROR',
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
                category: 'BAD_REQUEST',
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
