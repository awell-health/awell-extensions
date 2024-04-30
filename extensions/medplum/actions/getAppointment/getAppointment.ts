import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validateAndCreateSdkClient } from '../../utils'

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

    const res = await medplumSdk.readResource(
      'Appointment',
      input.appointmentId
    )

    /**
     * TODO:
     * Either create specific data points and pick from the appointment object what we need OR
     * store the full object and allow introspection and picking the values the builder needs in Awell Studio.
     */
    await onComplete({
      data_points: {
        appointmentData: JSON.stringify(res),
      },
    })
  },
}
