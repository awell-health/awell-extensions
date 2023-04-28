/* eslint-disable @typescript-eslint/naming-convention */
import { ZodError } from 'zod'
import { FieldType, type Action, type Field } from '../../../lib/types'
import { Category } from '../../../lib/types/marketplace'
import { type settings } from '../settings'
import { makeAPIClient } from '../client'
import { fromZodError } from 'zod-validation-error'
import { AxiosError } from 'axios'
import { nonVisitNoteSchema } from '../validation/nonVisitNote.zod'
import { NumericIdSchema } from '../../../lib/shared/validation'

const fields = {
  nonVisitNoteId: {
    id: 'nonVisitNoteId',
    label: 'Non-Visit Note ID',
    description: 'ID of a note',
    type: FieldType.NUMERIC,
    required: true,
  },
  text: {
    id: 'text',
    label: 'Text',
    description: 'Text of a note',
    type: FieldType.STRING,
    required: false,
  },
  author: {
    id: 'author',
    label: 'Author',
    description: 'Author of a note. Should be ID of a User.',
    type: FieldType.NUMERIC,
    required: false,
  },
  patient: {
    id: 'patient',
    label: 'Patient',
    description: 'ID of a Patient',
    type: FieldType.NUMERIC,
    required: false,
  },
  practice: {
    id: 'practice',
    label: 'Practice',
    description: 'ID of a Practice',
    type: FieldType.NUMERIC,
    required: false,
  },
  documentDate: {
    id: 'documentDate',
    label: 'Document Date',
    description: 'Date in ISO 8601 format',
    type: FieldType.DATE,
    required: false,
  },
  chartDate: {
    id: 'chartDate',
    label: 'Chart Date',
    description: 'Date in ISO 8601 format',
    type: FieldType.DATE,
    required: false,
  },
  tags: {
    id: 'tags',
    label: 'Tags',
    description: 'Comma-separated list of tags IDs',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

export const updateNonVisitNote: Action<typeof fields, typeof settings> = {
  key: 'updateNonVisitNote',
  category: Category.EHR_INTEGRATIONS,
  title: 'Update Non-Visit Note',
  description: "Update a Non-Visit Note using Elation's patient API.",
  fields,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const {
        nonVisitNoteId,
        author,
        chartDate,
        documentDate,
        text,
        ...fields
      } = payload.fields
      const noteId = NumericIdSchema.parse(nonVisitNoteId)
      const note = nonVisitNoteSchema.partial().parse({
        ...fields,
        bullets: [{ text, author }],
        document_date: documentDate,
        chart_date: chartDate,
      })

      const api = makeAPIClient(payload.settings)
      await api.updateNonVisitNote(noteId, note)
      await onComplete()
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
