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
import { nonVisitNoteSchema } from '../validation/nonVisitNote.zod'
import { isNil } from 'lodash'

/**
 * Although fields are not required, editing of e.g. bullet text requires providing a bullet id and an author
 */
const fields = {
  nonVisitNoteId: {
    id: 'nonVisitNoteId',
    label: 'Non-Visit Note ID',
    description: 'ID of a note.',
    type: FieldType.NUMERIC,
    required: true,
  },
  nonVisitNoteBulletId: {
    id: 'nonVisitNoteBulletId',
    label: 'Non-Visit Note Bullet ID',
    description:
      'ID of a bullet in a note. Required when want to edit text, author or category of a note.',
    type: FieldType.NUMERIC,
    required: false,
  },
  text: {
    id: 'text',
    label: 'Text',
    description: 'Text of a note. Required when "Bullet ID" is provided.',
    type: FieldType.TEXT,
    required: false,
  },
  authorId: {
    id: 'authorId',
    label: 'Author',
    description:
      'Author of a note. Should be ID of a User. Required when "Bullet ID" is provided.',
    type: FieldType.NUMERIC,
    required: false,
  },
  patientId: {
    id: 'patientId',
    label: 'Patient',
    description: 'ID of a Patient',
    type: FieldType.NUMERIC,
    required: false,
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
    description: 'ID of a Practice.',
    type: FieldType.NUMERIC,
    required: false,
  },
  documentDate: {
    id: 'documentDate',
    label: 'Document Date',
    description: 'Date in ISO 8601 format.',
    type: FieldType.DATE,
    required: false,
  },
  chartDate: {
    id: 'chartDate',
    label: 'Chart Date',
    description: 'Date in ISO 8601 format.',
    type: FieldType.DATE,
    required: false,
  },
  tags: {
    id: 'tags',
    label: 'Tags',
    description: 'Comma-separated list of tags IDs.',
    type: FieldType.STRING,
    required: false,
  },
  signed_by: {
    id: 'signed_by',
    label: 'Signed by (user ID)',
    description:
      '⚠️ DEPRECATED - Please use the "Sign non-visit note" action to sign a non-visit note instead.',
    type: FieldType.NUMERIC,
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
    const {
      nonVisitNoteId,
      nonVisitNoteBulletId,
      authorId,
      chartDate,
      documentDate,
      text,
      category,
      patientId,
      practiceId,
      signed_by,
      ...fields
    } = payload.fields
    const noteId = NumericIdSchema.parse(nonVisitNoteId)
    // partial - all fields are optional
    const note = nonVisitNoteSchema.partial().parse({
      ...fields,
      patient: patientId,
      practice: practiceId,
      bullets: isNil(nonVisitNoteBulletId)
        ? undefined
        : [{ id: nonVisitNoteBulletId, text, author: authorId, category }],
      document_date: documentDate,
      chart_date: chartDate,
      ...(!isNil(signed_by) && {
        signed_by,
        sign_date: new Date().toISOString(),
      }),
    })

    const api = makeAPIClient(payload.settings)
    await api.updateNonVisitNote(noteId, note)
    await onComplete()
  },
}
