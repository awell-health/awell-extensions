import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validatePayloadAndCreateClient } from '../../helpers'
import { PatientSchema } from '../../api/schema/patient'

export const getPatient: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getPatient',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get patient',
  description: 'Retrieve patient details from Athena',
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

    const res = await client.getPatient({ practiceId, ...input })

    // Both validates and transforms some of the response data
    const patient = PatientSchema.parse(res)

    await onComplete({
      data_points: {
        firstName: patient.firstname,
        lastName: patient.lastname,
        dob: patient.dob,
        email: patient.email,
      },
    })
  },
}
