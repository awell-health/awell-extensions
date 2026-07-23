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
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log({ meta, fields: payload.fields }, 'Processing searchPatient')

    const { fields: input, medplumSdk } = await validateAndCreateSdkClient({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const searchParams: Record<string, string> = {}
    searchParams[input.parameter] = input.value

    const bundle = await medplumSdk.search('Patient', searchParams)

    const patient = bundle.entry?.[0]?.resource ?? null

    await onComplete({
      data_points: {
        patientData: JSON.stringify(patient),
        searchResults: JSON.stringify(bundle),
      },
    })
  },
}
