import { type Action, Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema, type settings } from '../../settings'
import { makeAPIClient } from '../../client'
import { FindAppointmentFieldSchema } from '../../validation/appointment.zod'
import { z } from 'zod'
import { FieldsValidationSchema, fields, dataPoints } from './config'

export const findAppointments: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'findAppointment',
  category: Category.EHR_INTEGRATIONS,
  title: 'Find Appointment',
  description:
    'Retrieve appointments for a given patient, physician, practice, and/or times',
  fields,
  previewable: true,
  supports_automated_retries: true,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log({ meta, fields: payload.fields }, 'Processing findAppointment')

    try {
      const { fields, settings } = validate({
        schema: z.object({
          fields: FieldsValidationSchema,
          settings: SettingsValidationSchema,
        }),
        payload,
      })

      const findAppiontmentsParams = FindAppointmentFieldSchema.parse(fields)

      const client = makeAPIClient(settings)
      const resp = await client.findAppointments(findAppiontmentsParams)

      await onComplete({
        data_points: {
          appointments: JSON.stringify(resp),
          appointment_exists: resp.length > 0 ? 'true' : 'false',
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
