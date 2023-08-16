/* eslint-disable @typescript-eslint/naming-convention */
import {
  FieldType,
  type Action,
  type Field,
  Category,
  NumericIdSchema,
} from '@awell-health/extensions-core'
import { type settings } from '../settings'
import { makeAPIClient } from '../client'

const fields = {
  nonVisitNoteId: {
    id: 'nonVisitNoteId',
    label: 'Non-Visit Note ID',
    description: 'ID of a note',
    type: FieldType.NUMERIC,
    required: true,
  },
} satisfies Record<string, Field>

export const deleteNonVisitNote: Action<typeof fields, typeof settings> = {
  key: 'deleteNonVisitNote',
  category: Category.EHR_INTEGRATIONS,
  title: 'Delete Non-Visit Note',
  description: "Delete a Non-Visit Note using Elation's patient API.",
  fields,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const { nonVisitNoteId } = payload.fields
      const noteId = NumericIdSchema.parse(nonVisitNoteId)

      const api = makeAPIClient(payload.settings)
      await api.deleteNonVisitNote(noteId)

      await onComplete()
    } catch (err) {
      /**
       * re-throw to be handled inside awell-extension-server
       */
      throw err
    }
  },
}
