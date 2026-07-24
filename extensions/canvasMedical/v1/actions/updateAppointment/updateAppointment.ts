import { validate, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category } from '@awell-health/extensions-core'
import { fields, dataPoints, fieldsValidationSchema } from './config'
import {
  isAxiosError,
  isZodError,
  parseAxiosError,
  parseUnknowError,
  parseZodError,
} from '../../utils'
import { z } from 'zod'
import { type AxiosError } from 'axios'
import { makeAPIClient } from '../../client'
import { appointmentWithIdSchema } from '../../validation'

export const updateAppointment: Action<typeof fields, typeof settings> = {
  key: 'updateAppointment',
  category: Category.EHR_INTEGRATIONS,
  title: 'Update Appointment',
  description: 'Update an appointment',
  fields,
  dataPoints,
  previewable: true,
  onEvent: async ({ payload, onComplete, onError, helpers }) => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log(
      { meta, fields: payload.fields },
      'Processing updateAppointment',
    )

    try {
      validate({
        schema: z.object({
          fields: fieldsValidationSchema,
        }),
        payload,
      })

      const appointmentData = appointmentWithIdSchema.parse(
        JSON.parse(payload.fields.appointmentData as string),
      )
      const api = makeAPIClient(payload.settings)
      const appointmentId = await api.updateAppointment(appointmentData)
      await onComplete({
        data_points: {
          appointmentId,
        },
      })
    } catch (error) {
      helpers.log({ meta, error }, 'error', error as Error)
      let parsedError

      if (isZodError(error)) {
        parsedError = parseZodError(error)
      } else if (isAxiosError(error)) {
        parsedError = parseAxiosError(error as AxiosError)
      } else {
        parsedError = parseUnknowError(error as Error)
      }
      await onError({
        events: [parsedError],
      })
    }
  },
}
