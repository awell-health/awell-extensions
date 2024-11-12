import { z } from 'zod'
import { isNil, isEmpty } from 'lodash'
import { type Action, Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema, type settings } from '../../settings'
import { makeAPIClient } from '../../client'
import type {
  measurementInputSchema,
  AddVitalsInputType,
} from '../../types/vitals'
import {
  FieldsValidationSchema,
  fields as elationFields,
  dataPoints,
} from './config'

// Helper function to create measurement objects with optional notes
const createMeasurement = (
  value?: number,
  note?: string
): Array<z.infer<typeof measurementInputSchema>> => {
  // the undefined check is stupid but otherwise the build is failing
  if (value !== undefined && !isNil(value)) {
    return isEmpty(note)
      ? [
          { value: value.toString() } satisfies z.infer<
            typeof measurementInputSchema
          >,
        ]
      : [
          { value: value.toString(), note } satisfies z.infer<
            typeof measurementInputSchema
          >,
        ]
  }
  return []
}

export const addVitals: Action<
  typeof elationFields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'addVitals',
  category: Category.EHR_INTEGRATIONS,
  title: 'Add Vitals',
  description: 'Add vitals for the patient',
  fields: elationFields,
  previewable: true,
  dataPoints,
  onEvent: async ({ payload, onComplete }): Promise<void> => {
    const { fields, settings } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
        settings: SettingsValidationSchema,
      }),
      payload,
    })

    const api = makeAPIClient(settings)

    const body: AddVitalsInputType = {
      patient: fields.patientId,
      practice: fields.practiceId,
      visit_note: fields?.visitNoteId,
      non_visit_note: fields?.nonVisitNoteId,
      bmi: fields.bmi,
      height: createMeasurement(fields.height, fields.heightNote),
      weight: createMeasurement(fields.weight, fields.weightNote),
      oxygen: createMeasurement(fields.oxygen, fields.oxygenNote),
      rr: createMeasurement(fields.rr, fields.rrNote),
      hr: createMeasurement(fields.hr, fields.hrNote),
      hc: createMeasurement(fields.hc, fields.hcNote),
      temperature: createMeasurement(
        fields.temperature,
        fields.temperatureNote
      ),
      bp: createMeasurement(fields.bp, fields.bpNote),
      bodyfat: createMeasurement(fields.bodyfat, fields.bodyfatNote),
      dlm: createMeasurement(fields.dlm, fields.dlmNote),
      bfm: createMeasurement(fields.bfm, fields.bfmNote),
      wc: createMeasurement(fields.wc, fields.wcNote),
    }

    const { id } = await api.addVitals(body)

    await onComplete({
      data_points: {
        vitalsId: String(id),
      },
    })
  },
}
