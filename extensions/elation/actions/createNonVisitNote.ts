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
  text: {
    id: 'text',
    label: 'Text',
    description: 'Text of a note',
    type: FieldType.STRING,
    required: true,
  },
  authorId: {
    id: 'authorId',
    label: 'Author',
    description: 'Author of a note. Should be ID of a User.',
    type: FieldType.NUMERIC,
    required: true,
  },
  patientId: {
    id: 'patientId',
    label: 'Patient',
    description: 'ID of a Patient',
    type: FieldType.NUMERIC,
    required: true,
  },
  category: {
    id: 'category',
    label: 'Category',
    description:
      'Category of a note. Defaults to "Problem". One from the list: "Problem", "Past", "Family", "Social", "Instr", "PE", "ROS", "Med", "Data", "Assessment", "Test", "Tx", "Narrative", "Followup", "Reason", "Plan", "Objective", "Hpi", "Allergies", "Habits", "Assessplan", "Consultant", "Attending", "Dateprocedure", "Surgical", "Orders", "Referenced", "Procedure".',
    type: FieldType.STRING,
    required: false,
  },
  practiceId: {
    id: 'practiceId',
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
    required: true,
  },
  chartDate: {
    id: 'chartDate',
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
      const {
        authorId,
        chartDate,
        documentDate,
        text,
        category,
        patientId,
        practiceId,
        ...fields
      } = payload.fields
      const note = nonVisitNoteSchema.parse({
        ...fields,
        patient: patientId,
        practice: practiceId,
        bullets: [{ text, author: authorId, category }],
        document_date: documentDate,
        chart_date: chartDate,
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
