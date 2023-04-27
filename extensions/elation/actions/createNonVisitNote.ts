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
import { nonVisitNoteSchema } from '../validation/nonVisitNote.zod'

const fields = {
  text: {
    id: 'text',
    label: 'Text',
    description: 'Text of a note',
    type: FieldType.STRING,
    required: true,
  },
  author: {
    id: 'author',
    label: 'Author',
    description: 'Author of a note. Should be ID of a User.',
    type: FieldType.NUMERIC,
    required: true,
  },
  patient: {
    id: 'patient',
    label: 'Patient',
    description: 'ID of a Patient',
    type: FieldType.NUMERIC,
    required: true,
  },
  practice: {
    id: 'practice',
    label: 'Practice',
    description: 'ID of a Practice',
    type: FieldType.NUMERIC,
    required: false,
  },
  document_date: {
    id: 'document_date',
    label: 'Document Date',
    description: 'Date in ISO 8601 format',
    type: FieldType.DATE,
    required: true,
  },
  chart_date: {
    id: 'chart_date',
    label: 'Chart Date',
    description: 'Date in ISO 8601 format',
    type: FieldType.DATE,
    required: true,
  },
  tags: {
    id: 'tags',
    label: 'Tags',
    description: 'Comma-separated list of tags IDs',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

const dataPoints = {
  nonVisitNoteId: {
    key: 'nonVisitNoteId',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>

export const createNonVisitNote: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createNonVisitNote',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create Non-Visit Note',
  description: "Create a Non-Visit Note using Elation's patient API.",
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const note = nonVisitNoteSchema.parse(payload.fields)

      const api = makeAPIClient(payload.settings)
      const { id } = await api.createNonVisitNote(note)
      await onComplete({
        data_points: {
          nonVisitNoteId: String(id),
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
