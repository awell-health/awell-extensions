import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '../../lib/sdk/validatePayloadAndCreateSdk'
import { type settings } from '../../settings'
import { dataPoints, fields, FieldsValidationSchema } from './config'

export const createAppointment: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createAppointment',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create 1:1 appointment',
  description: 'Create a 1:1 appointment in Healthie.',
  fields,
  dataPoints,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const {
      fields: {
        patientId,
        appointmentTypeId,
        datetime,
        contactTypeId,
        otherPartyId,
        metadata,
      },
      sdk,
    } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const { data } = await sdk.createAppointment({
      appointment_type_id: appointmentTypeId,
      contact_type: contactTypeId,
      other_party_id: otherPartyId,
      datetime,
      user_id: patientId,
      metadata,
    })

    await onComplete({
      data_points: {
        appointmentId: data.createAppointment?.appointment?.id,
      },
    })
  },
}
