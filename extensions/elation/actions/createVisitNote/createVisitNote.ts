import { z } from 'zod'
import { type Action, Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema, type settings } from '../../settings'
import { makeAPIClient } from '../../client'
import { fields, FieldsValidationSchema, dataPoints } from './config'

export const createVisitNote: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createVisitNote',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create Visit Note',
  description:
    'Create a visit note for a patient. This action will create a visit note in the patient chart.',
  fields,
  previewable: true,
  dataPoints,
  onEvent: async ({ payload, onComplete, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    const { fields, settings } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
        settings: SettingsValidationSchema,
      }),
      payload,
    })

    const api = makeAPIClient(settings)

    const createVisitNoteInput = {
      patient: fields.patientId,
      chart_date: new Date().toISOString(),
      document_date: new Date().toISOString(),
      template: fields.template,
      physician: fields.physicianId,
      bullets: [
        {
          text: fields.text,
          author: fields.authorId,
          category: fields.category,
        },
      ],
      type: fields?.type,
      confidential: fields?.confidential,
    }

    helpers.log(
      { meta, createVisitNoteInput },
      '[createVisitNote] Creating Elation visit note',
    )

    const { id } = await api.createVisitNote(createVisitNoteInput)

    await onComplete({
      data_points: {
        visitNoteId: String(id),
      },
    })
  },
}
