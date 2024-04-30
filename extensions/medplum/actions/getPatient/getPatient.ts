import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validateAndCreateSdkClient } from '../../utils'

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

    const res = await medplumSdk.readResource('Patient', input.patientId)

    /**
     * TODO:
     * Either create specific data points and pick from the patient object what we need OR
     * store the full object and allow introspection and picking the values the builder needs in Awell Studio.
     */
    await onComplete({
      data_points: {
        patientData: JSON.stringify(res),
      },
    })
  },
}
