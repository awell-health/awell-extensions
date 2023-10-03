/* eslint-disable @typescript-eslint/naming-convention */
import { ZodError } from 'zod'
import {
  FieldType,
  type Action,
  type DataPointDefinition,
  type Field,
  Category,
} from '@awell-health/extensions-core'
import { type settings } from '../settings'
import { makeAPIClient } from '../client'
import { fromZodError } from 'zod-validation-error'
import { AxiosError } from 'axios'
import { nonVisitNoteSchema } from '../validation/nonVisitNote.zod'

const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: '',
    type: FieldType.NUMERIC,
    required: true,
  },
  // Practice ID is not required so leaving it out for simplicity
  // practiceId: {
  //   id: 'practiceId',
  //   label: 'Practice',
  //   description: 'ID of a Practice',
  //   type: FieldType.NUMERIC,
  //   required: false,
  // },
  authorId: {
    id: 'authorId',
    label: 'Author',
    description: 'The author of a note. Should be the ID of a User in Elation.',
    type: FieldType.NUMERIC,
    required: true,
  },
  category: {
    id: 'category',
    label: 'Category',
    description:
      'The Category of a note, defaults to "Problem". Read the extension documentation for the list of possible values.',
    type: FieldType.STRING,
    required: false,
  },
  tags: {
    id: 'tags',
    label: 'Tags',
    description: 'Comma-separated list of tags IDs',
    type: FieldType.STRING,
    required: false,
  },
  text: {
    id: 'text',
    label: 'Text',
    description: 'Text of a note',
    type: FieldType.TEXT,
    required: true,
  },
} satisfies Record<string, Field>

const dataPoints = {
  nonVisitNoteId: {
    key: 'nonVisitNoteId',
    valueType: 'number',
  },
  nonVisitNoteBulletId: {
    key: 'nonVisitNoteBulletId',
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
      const { patientId, authorId, text, category, ...fields } = payload.fields

      const note = nonVisitNoteSchema.parse({
        ...fields,
        patient: patientId,
        bullets: [{ text, author: authorId, category }],
        document_date: new Date().toISOString(),
        chart_date: new Date().toISOString(),
      })

      const api = makeAPIClient(payload.settings)
      const { id, bullets } = await api.createNonVisitNote(note)
      await onComplete({
        data_points: {
          nonVisitNoteId: String(id),
          nonVisitNoteBulletId: String(bullets[0].id),
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
