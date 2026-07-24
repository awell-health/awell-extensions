import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validatePayloadAndCreateClient } from '../../helpers'
import { omit } from 'lodash'

export const createAppointmentNote: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createAppointmentNote',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create appointment note',
  description: 'Creates a note for a specific appointment',
  fields,
  previewable: true,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log(
      { meta, fields: payload.fields },
      'Processing createAppointmentNote',
    )

    const {
      fields: input,
      client,
      settings: { practiceId },
    } = await validatePayloadAndCreateClient({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const res = await client.createAppointmentNote({
      practiceId,
      appointmentId: input.appointmentid,
      data: omit(input, ['appointmentid']),
    })

    if (res.success === 'true') {
      await onComplete()
      return
    }

    await onError({
      events: [
        {
          date: new Date().toISOString(),
          text: { en: 'Unable to create the appointment note' },
          error: {
            category: 'SERVER_ERROR',
            message: 'Unable to create the appointment note',
          },
        },
      ],
    })
  },
}
