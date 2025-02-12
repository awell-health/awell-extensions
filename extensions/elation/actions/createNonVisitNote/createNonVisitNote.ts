import { z } from 'zod'
import { type Action, Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema, type settings } from '../../settings'
import { makeAPIClient } from '../../client'
import { AxiosError } from 'axios'
import { nonVisitNoteSchema } from '../../validation/nonVisitNote.zod'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'

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
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const {
      fields: { patientId, authorId, tags, text, category },
      settings,
    } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
        settings: SettingsValidationSchema,
      }),
      payload,
    })

    const note = nonVisitNoteSchema.parse({
      tags,
      patient: patientId,
      bullets: [{ text, author: authorId, category }],
      document_date: new Date().toISOString(),
      chart_date: new Date().toISOString(),
    })

    const api = makeAPIClient(settings)

    try {
      const {
        data: { id, bullets },
      } = await api.createNonVisitNote(note)

      await onComplete({
        data_points: {
          nonVisitNoteId: String(id),
          nonVisitNoteBulletId: String(bullets[0].id),
        },
      })
    } catch (err) {
      if (err instanceof AxiosError) {
        await onError({
          events: [
            addActivityEventLog({
              message: `${String(err.response?.status)}: ${String(err.response?.statusText)}\n${JSON.stringify(err.response?.data, null, 2)}`,
            }),
          ],
        })
        return
      }

      throw err
    }
  },
}
