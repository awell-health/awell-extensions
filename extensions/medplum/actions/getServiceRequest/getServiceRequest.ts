import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validateAndCreateSdkClient } from '../../utils'
import { extractResourceId } from '../../utils/extractResourceId/extractResourceId'

export const getServiceRequest: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getServiceRequest',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get service request',
  description: 'Retrieve service request details from Medplum',
  fields,
  previewable: true,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const { fields: input, medplumSdk } = await validateAndCreateSdkClient({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const resourceId =
      extractResourceId(input.resourceId, 'ServiceRequest') ?? ''

    const res = await medplumSdk.readResource('ServiceRequest', resourceId)

    const getPatientId = (): string | null => {
      const subjectReference = res.subject?.reference ?? ''

      if (subjectReference.startsWith('Patient')) {
        return extractResourceId(subjectReference, 'Patient')
      }

      return null
    }

    await onComplete({
      data_points: {
        serviceRequestResource: JSON.stringify(res),
        status: res.status,
        intent: res.intent,
        priority: res.priority,
        patientId: getPatientId(),
      },
    })
  },
}
