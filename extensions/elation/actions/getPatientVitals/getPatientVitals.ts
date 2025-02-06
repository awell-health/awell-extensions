import { type Action, Category, validate } from '@awell-health/extensions-core'
import { z } from 'zod'
import { makeAPIClient } from '../../client'
import { SettingsValidationSchema, type settings } from '../../settings'
import type {
  FindVitalsInputType
} from '../../types/vitals'
import {
  FieldsValidationSchema,
  dataPoints,
  fields as elationFields,
} from './config'


export const getPatientVitals: Action<
  typeof elationFields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getPatientVitals',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get Patient Vitals',
  description: 'Get vitals for the patient',
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

    const body: FindVitalsInputType = {
      patient: [fields.patientId],
    }

    const { results } = await api.findVitals(body)

    // TODO: this is paginated, we need to get all the pages
    const lastVital = results[results.length - 1]

    await onComplete({
      data_points: {
        vitalsId: String(lastVital.id),
        documentDate: lastVital.document_date,
        vitals: JSON.stringify(lastVital),
      },
    })
  },
}
