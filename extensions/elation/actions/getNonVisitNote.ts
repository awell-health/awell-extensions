/* eslint-disable @typescript-eslint/naming-convention */
import { ZodError } from 'zod'
import {
  FieldType,
  type Action,
  type DataPointDefinition,
  type Field,
} from '../../../lib/types'
import { Category } from '../../../lib/types/marketplace'
import { type settings } from '../settings'
import { makeAPIClient } from '../client'
import { fromZodError } from 'zod-validation-error'
import { AxiosError } from 'axios'
import { NumericIdSchema } from '../../../lib/shared/validation'

const fields = {
  nonVisitNoteId: {
    id: 'nonVisitNoteId',
    label: 'Non-Visit Note ID',
    description: 'ID of a note',
    type: FieldType.NUMERIC,
    required: true,
  },
} satisfies Record<string, Field>

const dataPoints = {
  text: {
    key: 'text',
    valueType: 'string',
  },
  authorId: {
    key: 'authorId',
    valueType: 'number',
  },
  patientId: {
    key: 'patientId',
    valueType: 'number',
  },
  practiceId: {
    key: 'practiceId',
    valueType: 'number',
  },
  documentDate: {
    key: 'documentDate',
    valueType: 'date',
  },
  chartDate: {
    key: 'chartDate',
    valueType: 'date',
  },
  tags: {
    key: 'tags',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const getNonVisitNote: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getNonVisitNote',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get Non-Visit Note',
  description: "Get a Non-Visit Note using Elation's patient API.",
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const { nonVisitNoteId } = payload.fields
      const noteId = NumericIdSchema.parse(nonVisitNoteId)

      const api = makeAPIClient(payload.settings)
      const { bullets, chart_date, document_date, patient, practice, tags } =
        await api.getNonVisitNote(noteId)

      await onComplete({
        data_points: {
          authorId:
            bullets?.length !== 0 ? String(bullets[0].author) : undefined,
          text: bullets?.length !== 0 ? bullets[0].text : undefined,
          chartDate: chart_date,
          documentDate: document_date,
          patientId: String(patient),
          practiceId: String(practice),
          tags: tags?.length !== 0 ? tags?.join(',') : undefined,
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
