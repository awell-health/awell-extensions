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
  previewable: false,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
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
