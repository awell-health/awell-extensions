import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validatePayloadAndCreateClient } from '../../helpers'
import { AppointmentSchema } from '../../api/schema/appointment'

export const getAppointment: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getAppointment',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get appointment',
  description: 'Retrieve appointment details from Athena',
  fields,
  previewable: true,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log({ meta, fields: payload.fields }, 'Processing getAppointment')

    const {
      fields: input,
      client,
      settings: { practiceId },
    } = await validatePayloadAndCreateClient({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const res = await client.getAppointment({ ...input, practiceId })

    // Both validates and transforms some of the response data
    const appt = AppointmentSchema.parse(res)

    await onComplete({
      data_points: {
        patientId: appt.patientid,
        startTime: appt.starttime,
        status: appt.appointmentstatus,
        appointmentTypeName: appt.appointmenttype,
        appointmentTypeId: appt.appointmenttypeid,
        date: appt.date,
        duration: String(appt.duration),
      },
    })
  },
}
