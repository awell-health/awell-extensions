import { z } from 'zod'
import { type Action, Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema, type settings } from '../../settings'
import { makeAPIClient } from '../../client'
import { fields, FieldsValidationSchema, dataPoints } from './config'

export const addAllergy: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'addAllergy',
  category: Category.EHR_INTEGRATIONS,
  title: 'Add Allergy',
  description:
    'Adds allergy to the patient profile. If allergy.name is NKDA, we will document a structured NKDA in the patient chart instead of creating a patient allergy called "NKDA"',
  fields,
  previewable: true,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log({ meta, fields: payload.fields }, 'Processing addAllergy')

    try {
      const { fields, settings } = validate({
        schema: z.object({
          fields: FieldsValidationSchema,
          settings: SettingsValidationSchema,
        }),
        payload,
      })

      const api = makeAPIClient(settings)

      const addAllergyInput = {
        patient: fields.patientId,
        name: fields.name,
        start_date: fields.startDate,
        reaction: fields.reaction,
        severity: fields.severity,
      }

      helpers.log(
        { meta, addAllergyInput },
        '[addAllergy] Adding Elation allergy',
      )

      const { id } = await api.addAllergy(addAllergyInput)

      await onComplete({
        data_points: {
          allergyId: String(id),
        },
      })
    } catch (err) {
      helpers.log({ meta, err }, 'error', err as Error)
      const error = err as Error
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: error.message },
            error: {
              category: 'SERVER_ERROR',
              message: error.message,
            },
          },
        ],
      })
    }
  },
}
