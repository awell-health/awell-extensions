import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validateAndCreateSdkClient } from '../../utils'
import { extractResourceId } from '../../utils/extractResourceId/extractResourceId'

export const getAppointment: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getAppointment',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get appointment',
  description: 'Retrieve appointment details from Medplum',
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields: input, medplumSdk } = await validateAndCreateSdkClient({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const resourceId =
      extractResourceId(input.appointmentId, 'Appointment') ?? ''

    const res = await medplumSdk.readResource('Appointment', resourceId)

    await onComplete({
      data_points: {
        appointmentData: JSON.stringify(res),
      },
    })
  },
}
