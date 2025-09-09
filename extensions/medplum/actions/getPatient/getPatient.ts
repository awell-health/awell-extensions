import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validateAndCreateSdkClient } from '../../utils'
import { extractResourceId } from '../../utils/extractResourceId/extractResourceId'

export const getPatient: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getPatient',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get patient',
  description: 'Retrieve patient details from Medplum',
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields: input, medplumSdk } = await validateAndCreateSdkClient({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const resourceId = extractResourceId(input.patientId, 'Patient') ?? ''

    const res = await medplumSdk.readResource('Patient', resourceId)

    const patientFirstName = res?.name?.[0]?.given?.[0]
    const patientLastName = res?.name?.[0]?.family
    const patientDob = res?.birthDate
    const patientGender = res?.gender

    await onComplete({
      data_points: {
        patientData: JSON.stringify(res),
        patientFirstName,
        patientLastName,
        patientDob,
        patientGender,
      },
    })
  },
}
