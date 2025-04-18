import { type Action, Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
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
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const { patientId, authorId, tags, text, category } =
      FieldsValidationSchema.parse(payload.fields)

    const awellSdk = await helpers.awellSdk()
    const escapedPlainText = awellSdk.utils.awell.slateToEscapedJsString(text, {
      paragraphSpacing: 'single',
    }) // Strip any HTML from the text

    const unescapedPlainText = escapedPlainText
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')

    const note = nonVisitNoteSchema.parse({
      tags,
      patient: patientId,
      bullets: [{ text: unescapedPlainText, author: authorId, category }],
      document_date: new Date().toISOString(),
      chart_date: new Date().toISOString(),
    })

    const api = makeAPIClient(payload.settings)

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
