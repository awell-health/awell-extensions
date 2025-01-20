import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { validatePayloadAndCreateSdks } from '../../lib/validatePayloadAndCreateSdks'
import { AxiosError } from 'axios'
import { addActivityEventLog } from '../../../../src/lib/awell'

export const getAppointment: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getAppointment',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get appointment',
  description: 'Retrieve appointment details from Epic',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const {
      epicFhirR4Sdk,
      fields: { resourceId },
    } = await validatePayloadAndCreateSdks({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    try {
      const res = await epicFhirR4Sdk.getAppointment(resourceId)

      const patient = res.data.participant.find((participant) =>
        participant.actor?.reference?.startsWith('Patient'),
      )
      const patientId = patient?.actor?.reference?.split('/')[1]

      await onComplete({
        data_points: {
          appointment: JSON.stringify(res.data),
          patientId,
          appointmentStatus: res.data.status,
          appointmentStartDateTime: res.data.start,
          appointmentTypeCode: res.data?.appointmentType?.coding?.[0]?.code,
        },
      })
    } catch (error) {
      if (error instanceof AxiosError) {
        const err = error as AxiosError

        if (err.status === 404)
          await onError({
            events: [
              addActivityEventLog({
                message: 'Appointment not found',
              }),
            ],
          })
        return
      }

      // Throw all other errors
      throw error
    }
  },
}
