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
  dataPoints,
  onEvent: async ({ payload, onComplete }): Promise<void> => {
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
  },
}
