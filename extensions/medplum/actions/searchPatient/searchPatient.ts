import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validateAndCreateSdkClient } from '../../utils'

export const searchPatient: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'searchPatient',
  category: Category.EHR_INTEGRATIONS,
  title: 'Search patient',
  description: 'Search for patients in Medplum using parameters',
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields: input, medplumSdk } = await validateAndCreateSdkClient({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const searchParams: Record<string, string> = {}
    searchParams[input.parameter] = input.value

    const bundle = await medplumSdk.search('Patient', searchParams)
    
    const patient = bundle.entry?.[0]?.resource || null

    await onComplete({
      data_points: {
        patientData: JSON.stringify(patient),
        searchResults: JSON.stringify(bundle),
      },
    })
  },
}
