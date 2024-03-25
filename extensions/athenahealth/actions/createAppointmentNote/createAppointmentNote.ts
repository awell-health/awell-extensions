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
    const { fields: input, client } = await validatePayloadAndCreateClient({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    await client.createAppointmentNote({
      practiceId: input.practiceid,
      appointmentId: input.appointmentid,
      data: omit(input, ['practiceid', 'appointmentid']),
    })

    await onComplete()
  },
}
